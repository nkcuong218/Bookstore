package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.BookDto;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.entity.Genre;
import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Set;
import java.text.Normalizer;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;

    public Page<BookDto.Response> getBooks(String keyword, String genre, int page, int size, String sortBy) {
        Sort sort = switch (sortBy) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword;
        String g = (genre == null || genre.isBlank()) ? null : genre;

        return bookRepository.findWithFilters(kw, g, pageable)
                .map(BookDto.Response::fromEntity);
    }

    public BookDto.Response getById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));
        return BookDto.Response.fromEntity(book);
    }

    public List<BookDto.Response> getFeatured() {
        return bookRepository.findTop8ByOrderByRatingDesc()
                .stream().map(BookDto.Response::fromEntity).toList();
    }

    public List<BookDto.Response> getBestSellers(int size) {
        int safeSize = Math.max(1, Math.min(size, 20));
        Pageable pageable = PageRequest.of(0, safeSize);

        return bookRepository.findTopSellingBooks(Order.Status.CANCELLED, pageable)
                .stream()
                .map(BookDto.Response::fromEntity)
                .toList();
    }

    public List<String> getGenres() {
        List<String> fromGenreTable = genreRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(Genre::getName)
                .toList();

        if (!fromGenreTable.isEmpty()) {
            return fromGenreTable;
        }

        return bookRepository.findDistinctGenres();
    }

    // Admin methods
    public BookDto.Response create(BookDto.Request req) {
        Set<Genre> genres = resolveGenres(req);

        Book book = Book.builder()
                .title(req.getTitle())
                .author(req.getAuthor())
                .price(req.getPrice())
                .genres(genres)
                .description(req.getDescription())
                .coverUrl(saveBase64Image(req.getCoverUrl()))
                .sampleUrl(saveBase64Sample(req.getSampleUrl()))
                .samplePageUrls(saveSamplePages(req.getSamplePageUrls()))
                .isbn(req.getIsbn())
                .pages(req.getPages())
                .publisher(req.getPublisher())
                .yearPublished(req.getYearPublished())
                .language(req.getLanguage())
                .rating(req.getRating() != null ? req.getRating() : 0.0)
                .reviews(req.getReviews() != null ? req.getReviews() : 0)
                .stock(req.getStock() != null ? req.getStock() : 0)
                .build();
        return BookDto.Response.fromEntity(bookRepository.save(book));
    }

    public BookDto.Response update(Long id, BookDto.Request req) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));

        boolean hasGenreInput = (req.getGenres() != null && !req.getGenres().isEmpty());

        Set<Genre> genres = hasGenreInput ? resolveGenres(req) : book.getGenres();

        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setPrice(req.getPrice());
        if (hasGenreInput) {
            book.setGenres(genres);
        }
        book.setDescription(req.getDescription());
        book.setCoverUrl(saveBase64Image(req.getCoverUrl()));
        book.setSampleUrl(saveBase64Sample(req.getSampleUrl()));
        if (req.getSamplePageUrls() != null) {
            book.setSamplePageUrls(saveSamplePages(req.getSamplePageUrls()));
        }
        book.setIsbn(req.getIsbn());
        book.setPages(req.getPages());
        book.setPublisher(req.getPublisher());
        book.setYearPublished(req.getYearPublished());
        book.setLanguage(req.getLanguage());
        if (req.getRating() != null) book.setRating(req.getRating());
        if (req.getStock() != null) book.setStock(req.getStock());

        return BookDto.Response.fromEntity(bookRepository.save(book));
    }

    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sách!");
        }
        bookRepository.deleteById(id);
    }

    private String saveBase64Image(String coverUrl) {
        if (coverUrl == null || !coverUrl.startsWith("data:image")) {
            return coverUrl;
        }
        
        try {
            String[] parts = coverUrl.split(",");
            String header = parts[0];
            String data = parts[1];
            
            String extension = "jpg";
            if (header.contains("png")) extension = "png";
            else if (header.contains("jpeg") || header.contains("jpg")) extension = "jpg";
            else if (header.contains("webp")) extension = "webp";
            
            byte[] imageBytes = Base64.getDecoder().decode(data);
            
            Path uploadDir = Paths.get("uploads/books");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            String fileName = UUID.randomUUID().toString() + "." + extension;
            Path filePath = uploadDir.resolve(fileName);
            
            Files.write(filePath, imageBytes);
            
            return "http://localhost:8080/uploads/books/" + fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return coverUrl;
        }
    }

    private String saveBase64Sample(String sampleUrl) {
        if (sampleUrl == null || sampleUrl.isBlank()) {
            return sampleUrl;
        }

        String trimmed = sampleUrl.trim();
        if (!trimmed.startsWith("data:application/pdf;base64,")) {
            return trimmed;
        }

        try {
            String[] parts = trimmed.split(",", 2);
            if (parts.length < 2) {
                return trimmed;
            }

            byte[] pdfBytes = Base64.getDecoder().decode(parts[1]);

            Path uploadDir = Paths.get("uploads/samples");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = UUID.randomUUID() + ".pdf";
            Path filePath = uploadDir.resolve(fileName);

            Files.write(filePath, pdfBytes);

            return "http://localhost:8080/uploads/samples/" + fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return trimmed;
        }
    }

    private java.util.List<String> saveSamplePages(java.util.List<String> samplePageUrls) {
        if (samplePageUrls == null) {
            return null;
        }

        java.util.List<String> processed = new ArrayList<>();
        for (String pageUrl : samplePageUrls) {
            if (pageUrl == null || pageUrl.isBlank()) {
                continue;
            }

            String saved = saveBase64SampleImage(pageUrl);
            if (saved != null && !saved.isBlank()) {
                processed.add(saved);
            }
        }

        return processed;
    }

    private String saveBase64SampleImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return imageUrl;
        }

        String trimmed = imageUrl.trim();
        if (!trimmed.startsWith("data:image")) {
            return trimmed;
        }

        try {
            String[] parts = trimmed.split(",", 2);
            if (parts.length < 2) {
                return trimmed;
            }

            String header = parts[0].toLowerCase(Locale.ROOT);
            String extension = "jpg";
            if (header.contains("image/png")) extension = "png";
            else if (header.contains("image/webp")) extension = "webp";
            else if (header.contains("image/jpeg") || header.contains("image/jpg")) extension = "jpg";

            byte[] imageBytes = Base64.getDecoder().decode(parts[1]);

            Path uploadDir = Paths.get("uploads/samples/pages");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = UUID.randomUUID() + "." + extension;
            Path filePath = uploadDir.resolve(fileName);
            Files.write(filePath, imageBytes);

            return "http://localhost:8080/uploads/samples/pages/" + fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return trimmed;
        }
    }

    private Set<Genre> resolveGenres(BookDto.Request req) {
        LinkedHashSet<String> names = new LinkedHashSet<>();

        if (req.getGenres() != null) {
            req.getGenres().stream()
                    .filter(item -> item != null && !item.isBlank())
                    .map(String::trim)
                    .forEach(names::add);
        }

        LinkedHashSet<Genre> result = new LinkedHashSet<>();
        for (String name : names) {
            result.add(findOrCreateGenre(name));
        }

        return result;
    }

    private Genre findOrCreateGenre(String name) {
        return genreRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            String slug = toSlug(name);
            String uniqueSlug = slug;
            int suffix = 2;

            while (genreRepository.findBySlug(uniqueSlug).isPresent()) {
                uniqueSlug = slug + "-" + suffix;
                suffix++;
            }

            Genre genre = Genre.builder()
                    .name(name)
                    .slug(uniqueSlug)
                    .active(true)
                    .build();

            return genreRepository.save(genre);
        });
    }

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "genre" : normalized;
    }
}
