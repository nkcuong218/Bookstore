package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.Review;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDto {

    @Data
    public static class ItemReviewRequest {
        @NotNull(message = "Item id không được trống")
        private Long itemId;

        @NotNull(message = "Số sao không được trống")
        @Min(value = 1, message = "Số sao tối thiểu là 1")
        @Max(value = 5, message = "Số sao tối đa là 5")
        private Integer rating;

        private String comment;
    }

    @Data
    public static class SubmitOrderRequest {
        @Valid
        @NotEmpty(message = "Danh sách đánh giá không được trống")
        private List<ItemReviewRequest> items;
    }

    @Data
    public static class SubmitOrderResponse {
        private Long orderId;
        private Integer createdCount;
        private String message;
    }

    @Data
    public static class ReviewResponse {
        private Long id;
        private Long userId;
        private String userName;
        private Long bookId;
        private String bookTitle;
        private String orderCode;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public static ReviewResponse fromEntity(Review review) {
            ReviewResponse res = new ReviewResponse();
            res.id = review.getId();
            res.userId = review.getUser() != null ? review.getUser().getId() : null;
            res.userName = review.getUser() != null ? review.getUser().getFullName() : null;
            res.bookId = review.getBook() != null ? review.getBook().getId() : null;
            res.bookTitle = review.getBook() != null ? review.getBook().getTitle() : null;
            res.orderCode = review.getOrder() != null ? review.getOrder().getOrderCode() : null;
            res.rating = review.getRating();
            res.comment = review.getComment();
            res.createdAt = review.getCreatedAt();
            return res;
        }
    }
}
