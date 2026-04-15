package com.pthttmdt.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "books")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private Long price;

    @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(
            name = "book_genres",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
        )
        private Set<Genre> genres = new LinkedHashSet<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String coverUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String sampleUrl;

    @ElementCollection
    @CollectionTable(name = "book_sample_pages", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    @OrderColumn(name = "page_order")
    private List<String> samplePageUrls = new ArrayList<>();

    private String isbn;

    private Integer pages;

    private String publisher;

    private Integer yearPublished;

    private String language;

    private Double rating;

    private Integer reviews;

    @Column(nullable = false)
    private Integer stock = 0;

    private Boolean inStock = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        inStock = stock != null && stock > 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        inStock = stock != null && stock > 0;
    }
}
