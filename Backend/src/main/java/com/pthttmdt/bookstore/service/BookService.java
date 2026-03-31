package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.BookDto;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

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

    public List<String> getGenres() {
        return bookRepository.findDistinctGenres();
    }

    // Admin methods
    public BookDto.Response create(BookDto.Request req) {
        Book book = Book.builder()
                .title(req.getTitle())
                .author(req.getAuthor())
                .price(req.getPrice())
                .genre(req.getGenre())
                .description(req.getDescription())
                .coverUrl(saveBase64Image(req.getCoverUrl()))
                .isbn(req.getIsbn())
                .pages(req.getPages())
                .publisher(req.getPublisher())
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

        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setPrice(req.getPrice());
        book.setGenre(req.getGenre());
        book.setDescription(req.getDescription());
        book.setCoverUrl(saveBase64Image(req.getCoverUrl()));
        book.setIsbn(req.getIsbn());
        book.setPages(req.getPages());
        book.setPublisher(req.getPublisher());
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
}
