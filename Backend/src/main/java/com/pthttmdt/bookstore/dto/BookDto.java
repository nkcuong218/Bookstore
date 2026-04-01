package com.pthttmdt.bookstore.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class BookDto {

    @Data
    public static class Request {
        @NotBlank(message = "Tên sách không được trống")
        private String title;

        @NotBlank(message = "Tác giả không được trống")
        private String author;

        @NotNull(message = "Giá không được trống")
        private Long price;

        private List<String> genres;
        private String description;
        private String coverUrl;
        private String isbn;
        private Integer pages;
        private String publisher;
        private Integer yearPublished;
        private String language = "Tiếng Việt";
        private Double rating = 0.0;
        private Integer reviews = 0;
        private Integer stock = 0;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String author;
        private Long price;
        private List<String> genres;
        private String description;
        private String coverUrl;
        private String isbn;
        private Integer pages;
        private String publisher;
        private Integer yearPublished;
        private String language;
        private Double rating;
        private Integer reviews;
        private Integer stock;
        private Boolean inStock;
        private LocalDateTime createdAt;

        public static Response fromEntity(com.pthttmdt.bookstore.entity.Book book) {
            Response res = new Response();
            res.id = book.getId();
            res.title = book.getTitle();
            res.author = book.getAuthor();
            res.price = book.getPrice();
                List<String> genreNames = (book.getGenres() == null ? java.util.Set.<com.pthttmdt.bookstore.entity.Genre>of() : book.getGenres())
                    .stream()
                    .map(com.pthttmdt.bookstore.entity.Genre::getName)
                    .filter(name -> name != null && !name.isBlank())
                    .sorted(String::compareToIgnoreCase)
                    .toList();

                res.genres = genreNames;
            res.description = book.getDescription();
            res.coverUrl = book.getCoverUrl();
            res.isbn = book.getIsbn();
            res.pages = book.getPages();
            res.publisher = book.getPublisher();
            res.yearPublished = book.getYearPublished();
            res.language = book.getLanguage();
            res.rating = book.getRating();
            res.reviews = book.getReviews();
            res.stock = book.getStock();
            res.inStock = book.getInStock();
            res.createdAt = book.getCreatedAt();
            return res;
        }
    }
}
