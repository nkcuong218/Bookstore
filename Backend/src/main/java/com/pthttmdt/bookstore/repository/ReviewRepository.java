package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndOrderItemId(Long userId, Long orderItemId);

    long countByBookId(Long bookId);

    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);

    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("select avg(r.rating) from Review r where r.book.id = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") Long bookId);
}
