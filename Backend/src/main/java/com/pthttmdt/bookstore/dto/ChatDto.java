package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.entity.Book;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDto {

    @Data
    public static class Request {
        private Long userId;
        private Long orderId;
        private String message;
    }

    @Data
    public static class ProductCard {
        private Long id;
        private String name;
        private Long price;
        private String description;
        private String imageUrl;

        public static ProductCard fromEntity(Book book) {
            ProductCard card = new ProductCard();
            card.setId(book.getId());
            card.setName(book.getTitle());
            card.setPrice(book.getPrice());
            card.setDescription(book.getDescription());
            card.setImageUrl(book.getCoverUrl());
            return card;
        }
    }

    @Data
    public static class RagSource {
        private Long id;
        private String sourceType;
        private String title;
        private Double score;
    }

    @Data
    public static class OrderSummary {
        private Long id;
        private String orderCode;
        private String status;
        private Long totalAmount;
        private LocalDateTime createdAt;

        public static OrderSummary fromEntity(Order order) {
            OrderSummary summary = new OrderSummary();
            summary.setId(order.getId());
            summary.setOrderCode(order.getOrderCode());
            summary.setStatus(order.getStatus() != null ? order.getStatus().name() : "UNKNOWN");
            summary.setTotalAmount(order.getTotalAmount());
            summary.setCreatedAt(order.getCreatedAt());
            return summary;
        }
    }

    @Data
    public static class Response {
        private Long chatMessageId;
        private String intent;
        private String reply;
        private boolean usedAi;
        private List<ProductCard> products;
        private List<OrderSummary> orders;
        private List<RagSource> ragSources;
    }
}
