package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.ChatDto;
import com.pthttmdt.bookstore.entity.ChatMessage;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.repository.ChatMessageRepository;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    public enum Intent {
        PRODUCT,
        ORDER,
        FAQ,
        AI_FALLBACK
    }

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final OpenAiService openAiService;
    private final RagService ragService;
    private final PythonChatbotClient pythonChatbotClient;

    public ChatDto.Response chat(ChatDto.Request request) {
        ChatDto.Response pythonResponse = pythonChatbotClient.chat(request);
        if (pythonResponse != null && pythonResponse.getReply() != null && !pythonResponse.getReply().isBlank()) {
            normalizeResponseDefaults(pythonResponse);

            String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
            ChatMessage saved = saveChatLog(request, userMessage, pythonResponse);
            pythonResponse.setChatMessageId(saved.getId());
            return pythonResponse;
        }

        ragService.ensureKnowledgeBaseReady();

        String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        if (userMessage.isBlank()) {
            throw new IllegalArgumentException("Message không được để trống.");
        }

        Intent intent = detectIntent(userMessage, request.getOrderId());

        ChatDto.Response response = new ChatDto.Response();
        response.setIntent(intent.name());
        response.setUsedAi(false);
        response.setProducts(List.of());
        response.setOrders(List.of());
        response.setRagSources(List.of());

        List<RagService.RetrievedContext> contexts = ragService.retrieve(userMessage, 5);
        response.setRagSources(mapRagSources(contexts));

        switch (intent) {
            case PRODUCT -> handleProductIntent(userMessage, response, contexts);
            case ORDER -> handleOrderIntent(request, userMessage, response);
            case FAQ -> handleFaqIntent(userMessage, response, contexts);
            default -> handleAiFallback(userMessage, response, contexts);
        }

        // Nếu intent ban đầu không trả ra dữ liệu hữu ích, chuyển fallback sang AI.
        if ((response.getReply() == null || response.getReply().isBlank()) && intent != Intent.AI_FALLBACK) {
            handleAiFallback(userMessage, response, contexts);
            response.setIntent(Intent.AI_FALLBACK.name());
        }

        ChatMessage saved = saveChatLog(request, userMessage, response);
        response.setChatMessageId(saved.getId());

        return response;
    }

    private void normalizeResponseDefaults(ChatDto.Response response) {
        if (response.getIntent() == null || response.getIntent().isBlank()) {
            response.setIntent(Intent.AI_FALLBACK.name());
        }
        if (response.getProducts() == null) {
            response.setProducts(List.of());
        }
        if (response.getOrders() == null) {
            response.setOrders(List.of());
        }
        if (response.getRagSources() == null) {
            response.setRagSources(List.of());
        }
        if (response.getReply() == null) {
            response.setReply("");
        }
    }

    Intent detectIntent(String message, Long orderId) {
        String normalized = normalize(message);

        if (orderId != null || containsAny(normalized, "đơn", "order", "mã đơn", "trạng thái", "giao hàng")) {
            return Intent.ORDER;
        }

        if (containsAny(normalized, "sản phẩm", "product", "giá", "mua", "gợi ý", "tư vấn", "hàng")) {
            return Intent.PRODUCT;
        }

        if (containsAny(normalized, "ship", "phí ship", "vận chuyển", "đổi trả", "hoàn tiền", "faq", "chính sách")) {
            return Intent.FAQ;
        }

        return Intent.AI_FALLBACK;
    }

    private void handleProductIntent(String userMessage, ChatDto.Response response, List<RagService.RetrievedContext> contexts) {
        String keyword = extractProductKeyword(userMessage);

        List<Book> books = (keyword == null || keyword.isBlank())
                ? bookRepository.findAll(PageRequest.of(0, 5)).getContent()
                : bookRepository.searchByKeyword(keyword, PageRequest.of(0, 5)).getContent();

        String ragReply = openAiService.askWithRagContext(userMessage, contexts);

        List<ChatDto.ProductCard> cards = books.stream()
                .map(ChatDto.ProductCard::fromEntity)
                .toList();

        response.setProducts(cards);

        if (ragReply != null && !ragReply.isBlank()) {
            response.setReply(ragReply);
            response.setUsedAi(true);
        } else if (!cards.isEmpty()) {
            response.setReply("Mình tìm thấy một số sản phẩm phù hợp. Bạn xem danh sách bên dưới nhé.");
        } else {
            response.setReply("Hiện tại chưa tìm thấy sản phẩm phù hợp. Bạn có thể gửi tên sách cụ thể hơn để mình hỗ trợ nhé.");
        }
    }

    private void handleOrderIntent(ChatDto.Request request, String userMessage, ChatDto.Response response) {
        List<Order> foundOrders = new ArrayList<>();

        if (request.getOrderId() != null) {
            orderRepository.findById(request.getOrderId()).ifPresent(foundOrders::add);
        }

        if (foundOrders.isEmpty()) {
            Long messageOrderId = extractOrderId(userMessage);
            if (messageOrderId != null) {
                orderRepository.findById(messageOrderId).ifPresent(foundOrders::add);
            }
        }

        if (foundOrders.isEmpty()) {
            String orderCode = extractOrderCode(userMessage);
            if (orderCode != null) {
                orderRepository.findByOrderCode(orderCode).ifPresent(foundOrders::add);
            }
        }

        if (foundOrders.isEmpty() && request.getUserId() != null) {
            List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(request.getUserId());
            foundOrders.addAll(userOrders.stream().limit(3).toList());
        }

        if (foundOrders.isEmpty()) {
            response.setReply("Mình chưa tìm thấy đơn hàng. Bạn vui lòng cung cấp orderId, mã đơn (ví dụ ORD001) hoặc userId nhé.");
            return;
        }

        List<ChatDto.OrderSummary> summaries = foundOrders.stream()
                .map(ChatDto.OrderSummary::fromEntity)
                .toList();

        response.setOrders(summaries);
        response.setReply("Mình đã tìm thấy thông tin đơn hàng của bạn.");
    }

    private void handleFaqIntent(String userMessage, ChatDto.Response response, List<RagService.RetrievedContext> contexts) {
        String ragReply = openAiService.askWithRagContext(userMessage, contexts);
        if (ragReply != null && !ragReply.isBlank()) {
            response.setReply(ragReply);
            response.setUsedAi(true);
            return;
        }

        response.setReply("Mình đã tìm thấy một phần thông tin trong FAQ nhưng chưa đủ chắc chắn. Bạn vui lòng hỏi rõ hơn để mình hỗ trợ chính xác nhé.");
    }

    private void handleAiFallback(String userMessage, ChatDto.Response response, List<RagService.RetrievedContext> contexts) {
        String aiReply = openAiService.askWithRagContext(userMessage, contexts);
        if (aiReply == null || aiReply.isBlank()) {
            aiReply = openAiService.ask(userMessage);
        }

        if (aiReply == null || aiReply.isBlank()) {
            String contextFallback = buildContextFallback(contexts);
            response.setReply(contextFallback.isBlank()
                    ? "Mình chưa hiểu rõ yêu cầu. Bạn có thể mô tả chi tiết hơn để mình hỗ trợ tốt hơn không?"
                    : contextFallback);
            response.setUsedAi(false);
            return;
        }

        response.setReply(aiReply);
        response.setUsedAi(true);
    }

    private ChatMessage saveChatLog(ChatDto.Request request, String userMessage, ChatDto.Response response) {
        ChatMessage entity = ChatMessage.builder()
                .userId(request.getUserId())
                .orderId(request.getOrderId())
                .intent(response.getIntent())
                .userMessage(userMessage)
                .botResponse(response.getReply())
                .usedAi(response.isUsedAi())
                .build();

        return chatMessageRepository.save(entity);
    }

    private String buildContextFallback(List<RagService.RetrievedContext> contexts) {
        if (contexts == null || contexts.isEmpty()) {
            return "";
        }

        RagService.RetrievedContext top = contexts.get(0);
        return "Mình tìm thấy thông tin gần nhất từ nguồn " + top.sourceType() + ": " + top.title() + ". Bạn có thể hỏi cụ thể hơn để mình trả lời chính xác hơn.";
    }

    private List<ChatDto.RagSource> mapRagSources(List<RagService.RetrievedContext> contexts) {
        if (contexts == null) {
            return List.of();
        }

        return contexts.stream().map(context -> {
            ChatDto.RagSource source = new ChatDto.RagSource();
            source.setId(context.id());
            source.setSourceType(context.sourceType());
            source.setTitle(context.title());
            source.setScore(context.score());
            return source;
        }).toList();
    }

    private String extractProductKeyword(String message) {
        String normalized = normalize(message)
                .replace("tu van", "")
                .replace("goi y", "")
                .replace("san pham", "")
                .replace("gia", "")
                .trim();

        return normalized.isBlank() ? null : normalized;
    }

    private Long extractOrderId(String message) {
        Matcher matcher = Pattern.compile("\\b(\\d{1,10})\\b").matcher(message);
        if (!matcher.find()) {
            return null;
        }

        try {
            return Long.parseLong(matcher.group(1));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String extractOrderCode(String message) {
        Matcher matcher = Pattern.compile("\\bORD\\d+\\b", Pattern.CASE_INSENSITIVE).matcher(message);
        return matcher.find() ? matcher.group().toUpperCase() : null;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(normalize(keyword))) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String input) {
        String lower = input == null ? "" : input.toLowerCase(Locale.ROOT);
        String normalized = java.text.Normalizer.normalize(lower, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }
}
