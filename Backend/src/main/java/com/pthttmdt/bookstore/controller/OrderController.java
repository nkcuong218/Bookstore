package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.OrderDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // User: đặt hàng
    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderDto.CreateRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(orderService.createOrder(req, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User: xem đơn hàng của mình
    @GetMapping("/my")
    public ResponseEntity<List<OrderDto.Response>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getId()));
    }

    // User: xem chi tiết 1 đơn
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User: xác nhận đã nhận hàng
    @PatchMapping("/{id}/confirm-received")
    public ResponseEntity<?> confirmReceived(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(orderService.confirmReceived(id, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin: xem tất cả đơn hàng
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto.Response>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    // Admin: cập nhật trạng thái đơn hàng
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            return ResponseEntity.ok(orderService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
