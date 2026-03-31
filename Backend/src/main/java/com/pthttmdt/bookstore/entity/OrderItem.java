package com.pthttmdt.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    // Snapshot thông tin sách tại thời điểm đặt
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverUrl;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private Integer quantity;

    public Long getSubtotal() {
        return price * quantity;
    }
}
