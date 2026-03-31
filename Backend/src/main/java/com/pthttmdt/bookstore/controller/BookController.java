package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.BookDto;
import com.pthttmdt.bookstore.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // Public endpoints
    @GetMapping
    public ResponseEntity<Page<BookDto.Response>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(bookService.getBooks(keyword, genre, page, size, sortBy));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BookDto.Response>> getFeatured() {
        return ResponseEntity.ok(bookService.getFeatured());
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(bookService.getGenres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto.Response> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin endpoints
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDto.Response> create(@Valid @RequestBody BookDto.Request req) {
        return ResponseEntity.ok(bookService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody BookDto.Request req) {
        try {
            return ResponseEntity.ok(bookService.update(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            bookService.delete(id);
            return ResponseEntity.ok("Xóa sách thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
