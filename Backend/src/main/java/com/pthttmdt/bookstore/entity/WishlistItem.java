package com.pthttmdt.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlist_items",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "book_id"})
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean active;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (active == null) {
            active = true;
        }
        createdAt = LocalDateTime.now();
    }
}
