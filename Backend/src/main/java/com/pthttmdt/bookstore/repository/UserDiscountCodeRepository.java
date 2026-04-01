package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.DiscountCode;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.entity.UserDiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDiscountCodeRepository extends JpaRepository<UserDiscountCode, Long> {
    Optional<UserDiscountCode> findByUserAndDiscountCode(User user, DiscountCode discountCode);
    List<UserDiscountCode> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByDiscountCodeIdAndStatus(Long discountCodeId, UserDiscountCode.Status status);
}
