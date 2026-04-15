package com.pthttmdt.bookstore.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.entity.RagDocument;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.RagDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RagService {

    public record RetrievedContext(Long id, String sourceType, String title, String content, double score) {
    }

    private final RagDocumentRepository ragDocumentRepository;
    private final BookRepository bookRepository;
    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public int rebuildKnowledgeBase() {
        ragDocumentRepository.deleteAll();

        List<RagDocument> documents = new ArrayList<>();

        List<Book> books = bookRepository.findAll();
        for (Book book : books) {
            String content = buildBookContent(book);
            List<Double> embedding = openAiService.createEmbedding(content);

            documents.add(RagDocument.builder()
                    .sourceType("BOOK")
                    .sourceId(String.valueOf(book.getId()))
                    .title("Sach: " + safe(book.getTitle()))
                    .content(content)
                    .metadataJson(toJson(Map.of(
                            "bookId", book.getId(),
                            "author", safe(book.getAuthor()),
                            "price", book.getPrice() == null ? 0L : book.getPrice()
                    )))
                    .embeddingJson(toJson(embedding))
                    .build());
        }

        for (FaqSeed faq : getFaqSeeds()) {
            List<Double> embedding = openAiService.createEmbedding(faq.content());
            documents.add(RagDocument.builder()
                    .sourceType("FAQ")
                    .sourceId(faq.key())
                    .title(faq.title())
                    .content(faq.content())
                    .metadataJson(toJson(Map.of("key", faq.key())))
                    .embeddingJson(toJson(embedding))
                    .build());
        }

        ragDocumentRepository.saveAll(documents);
        return documents.size();
    }

    @Transactional(readOnly = true)
    public List<RetrievedContext> retrieve(String query, int topK) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        List<RagDocument> docs = ragDocumentRepository.findAll();
        if (docs.isEmpty()) {
            return List.of();
        }

        List<Double> queryEmbedding = openAiService.createEmbedding(query);

        List<RetrievedContext> ranked = new ArrayList<>();

        if (queryEmbedding != null && !queryEmbedding.isEmpty()) {
            for (RagDocument doc : docs) {
                List<Double> docEmbedding = parseEmbedding(doc.getEmbeddingJson());
                if (docEmbedding.isEmpty()) {
                    continue;
                }

                double score = cosineSimilarity(queryEmbedding, docEmbedding);
                ranked.add(new RetrievedContext(doc.getId(), doc.getSourceType(), doc.getTitle(), doc.getContent(), score));
            }

            ranked.sort(Comparator.comparingDouble(RetrievedContext::score).reversed());
        }

        // Fallback lexical search when embedding is unavailable.
        if (ranked.isEmpty()) {
            Set<String> queryTokens = tokenize(query);
            ranked = docs.stream()
                    .map(doc -> new RetrievedContext(
                            doc.getId(),
                            doc.getSourceType(),
                            doc.getTitle(),
                            doc.getContent(),
                            lexicalScore(queryTokens, tokenize(doc.getTitle() + " " + doc.getContent()))
                    ))
                    .sorted(Comparator.comparingDouble(RetrievedContext::score).reversed())
                    .toList();
        }

        return ranked.stream()
                .filter(ctx -> ctx.score() > 0)
                .limit(Math.max(1, topK))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public void ensureKnowledgeBaseReady() {
        if (ragDocumentRepository.count() == 0) {
            rebuildKnowledgeBase();
        }
    }

    private String buildBookContent(Book book) {
        String genres = book.getGenres() == null
                ? ""
                : book.getGenres().stream().map(genre -> safe(genre.getName())).collect(Collectors.joining(", "));

        return "Tieu de: " + safe(book.getTitle()) + "\n"
                + "Tac gia: " + safe(book.getAuthor()) + "\n"
                + "The loai: " + genres + "\n"
                + "Gia: " + (book.getPrice() == null ? "N/A" : book.getPrice() + " VND") + "\n"
                + "Ton kho: " + (book.getStock() == null ? 0 : book.getStock()) + "\n"
                + "Mo ta: " + safe(book.getDescription());
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    private List<Double> parseEmbedding(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        int len = Math.min(a.size(), b.size());
        if (len == 0) {
            return 0;
        }

        double dot = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < len; i++) {
            double x = a.get(i);
            double y = b.get(i);
            dot += x * y;
            normA += x * x;
            normB += y * y;
        }

        if (normA == 0 || normB == 0) {
            return 0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }

        String normalized = java.text.Normalizer.normalize(text.toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-z0-9\\s]", " ");

        return Arrays.stream(normalized.split("\\s+"))
                .filter(token -> token.length() > 1)
                .collect(Collectors.toSet());
    }

    private double lexicalScore(Set<String> queryTokens, Set<String> docTokens) {
        if (queryTokens.isEmpty() || docTokens.isEmpty()) {
            return 0;
        }

        long overlap = queryTokens.stream().filter(docTokens::contains).count();
        return (double) overlap / (double) queryTokens.size();
    }

    private List<FaqSeed> getFaqSeeds() {
        return List.of(
                new FaqSeed("shipping_fee", "FAQ: Phi van chuyen",
                        "Phi van chuyen duoc tinh theo dia chi nhan hang, khoang cach va don vi van chuyen. He thong se hien thi tong phi o buoc checkout truoc khi dat hang."),
                new FaqSeed("return_policy", "FAQ: Chinh sach doi tra",
                        "Khach hang co the doi tra trong vong 7 ngay ke tu khi nhan hang. San pham can con nguyen trang, day du phu kien va khong bi hu hong do nguoi dung."),
                new FaqSeed("payment_methods", "FAQ: Phuong thuc thanh toan",
                        "He thong ho tro COD va chuyen khoan ngan hang. Khi chon chuyen khoan, trang thai thanh toan se duoc cap nhat sau khi giao dich thanh cong."),
                new FaqSeed("support_contact", "FAQ: Ho tro khach hang",
                        "Neu can ho tro them, khach hang vui long lien he qua email ho tro cua cua hang hoac de lai noi dung trong khung chat de duoc phan hoi."));
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private record FaqSeed(String key, String title, String content) {
    }
}
