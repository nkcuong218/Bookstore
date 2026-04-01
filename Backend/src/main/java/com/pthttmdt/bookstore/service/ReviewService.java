package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.ReviewDto;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.entity.OrderItem;
import com.pthttmdt.bookstore.entity.Review;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.OrderRepository;
import com.pthttmdt.bookstore.repository.ReviewRepository;
import com.pthttmdt.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Transactional
    public ReviewDto.SubmitOrderResponse submitOrderReviews(Long orderId, Long userId, ReviewDto.SubmitOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá đơn hàng này!");
        }

        if (order.getStatus() != Order.Status.RECEIVED) {
            throw new RuntimeException("Chỉ có thể đánh giá sau khi đã nhận hàng!");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng không có sản phẩm để đánh giá!");
        }

        Map<Long, OrderItem> orderItemsById = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, item -> item));

        Set<Long> seenItemIds = new HashSet<>();
        Set<Long> touchedBookIds = new HashSet<>();
        List<Review> reviewsToCreate = new java.util.ArrayList<>();

        for (ReviewDto.ItemReviewRequest itemReq : req.getItems()) {
            Long itemId = itemReq.getItemId();
            if (itemId == null) {
                throw new RuntimeException("Item id không hợp lệ!");
            }

            if (!seenItemIds.add(itemId)) {
                throw new RuntimeException("Không thể đánh giá trùng sản phẩm trong cùng một lần gửi!");
            }

            OrderItem orderItem = orderItemsById.get(itemId);
            if (orderItem == null) {
                throw new RuntimeException("Sản phẩm không thuộc đơn hàng này!");
            }

            if (reviewRepository.existsByUserIdAndOrderItemId(userId, itemId)) {
                throw new RuntimeException("Sản phẩm \"" + orderItem.getBookTitle() + "\" đã được đánh giá trước đó!");
            }

            if (itemReq.getRating() == null || itemReq.getRating() < 1 || itemReq.getRating() > 5) {
                throw new RuntimeException("Số sao của \"" + orderItem.getBookTitle() + "\" không hợp lệ!");
            }

            String normalizedComment = itemReq.getComment() == null ? "" : itemReq.getComment().trim();
            if (normalizedComment.length() < 5) {
                throw new RuntimeException("Nhận xét của \"" + orderItem.getBookTitle() + "\" phải có ít nhất 5 ký tự!");
            }

            if (orderItem.getBook() == null) {
                throw new RuntimeException("Không tìm thấy thông tin sách để đánh giá!");
            }

            Review review = Review.builder()
                    .user(user)
                    .book(orderItem.getBook())
                    .order(order)
                    .orderItem(orderItem)
                    .rating(itemReq.getRating())
                    .comment(normalizedComment)
                    .build();

            reviewsToCreate.add(review);
            touchedBookIds.add(orderItem.getBook().getId());
        }

        if (reviewsToCreate.isEmpty()) {
            throw new RuntimeException("Không có đánh giá nào để lưu!");
        }

        reviewRepository.saveAll(reviewsToCreate);

        for (Long bookId : touchedBookIds) {
            syncBookRating(bookId);
        }

        ReviewDto.SubmitOrderResponse response = new ReviewDto.SubmitOrderResponse();
        response.setOrderId(orderId);
        response.setCreatedCount(reviewsToCreate.size());
        response.setMessage("Gửi đánh giá thành công!");
        return response;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto.ReviewResponse> getReviewsByBookId(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new RuntimeException("Không tìm thấy sách!");
        }

        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId)
                .stream()
                .map(ReviewDto.ReviewResponse::fromEntity)
                .toList();
    }

    private void syncBookRating(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));

        long reviewsCount = reviewRepository.countByBookId(bookId);
        Double averageRating = reviewRepository.findAverageRatingByBookId(bookId);

        double roundedRating = averageRating == null ? 0.0 : Math.round(averageRating * 10.0) / 10.0;

        book.setRating(roundedRating);
        book.setReviews((int) reviewsCount);
        bookRepository.save(book);
    }
}
