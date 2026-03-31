package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<Order> findByOrderCode(String orderCode);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != :status")
    Long calculateTotalRevenue(@org.springframework.data.repository.query.Param("status") Order.Status status);

    @org.springframework.data.jpa.repository.Query("SELECT b.title, SUM(oi.quantity), SUM(oi.price * oi.quantity) FROM OrderItem oi JOIN oi.book b JOIN oi.order o WHERE o.status != :status GROUP BY b.id, b.title ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingBooks(@org.springframework.data.repository.query.Param("status") Order.Status status, Pageable pageable);
}
