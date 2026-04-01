package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    Optional<DiscountCode> findByCodeIgnoreCase(String code);
    Optional<DiscountCode> findByCodeIgnoreCaseAndActiveTrue(String code);
    List<DiscountCode> findAllByOrderByCreatedAtDesc();
}
