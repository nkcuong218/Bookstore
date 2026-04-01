package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.ReviewDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<?> submitOrderReviews(
            @PathVariable Long orderId,
            @Valid @RequestBody ReviewDto.SubmitOrderRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(reviewService.submitOrderReviews(orderId, user.getId(), req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<?> getReviewsByBookId(@PathVariable Long bookId) {
        try {
            return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
