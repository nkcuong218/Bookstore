package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.DashboardDto;
import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.OrderRepository;
import com.pthttmdt.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class StatsController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardDto> getDashboardStats() {
        DashboardDto dto = new DashboardDto();

        // Count basic metrics
        dto.setTotalOrders(orderRepository.count());
        dto.setTotalUsers(userRepository.count());
        dto.setTotalBooks(bookRepository.count());

        Long revenue = orderRepository.calculateTotalRevenue(Order.Status.CANCELLED);
        dto.setTotalRevenue(formatCurrency(revenue != null ? revenue : 0L));

        // Get 5 recent orders
        Page<Order> recentOrderPage = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5));
        List<DashboardDto.RecentOrder> recentOrders = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        for (Order o : recentOrderPage.getContent()) {
            DashboardDto.RecentOrder ro = new DashboardDto.RecentOrder();
            ro.setId(o.getOrderCode());
            ro.setCustomer(o.getCustomerName() != null ? o.getCustomerName() : (o.getUser() != null ? o.getUser().getFullName() : "Khách ẩn danh"));
            ro.setTotal(formatCurrency(o.getTotalAmount() != null ? o.getTotalAmount() : 0L));
            ro.setDate(o.getCreatedAt() != null ? o.getCreatedAt().format(dtf) : "");
            
            // Map status directly
            switch (o.getStatus().name()) {
                case "DELIVERED": ro.setStatus("Đã giao"); break;
                case "SHIPPING": ro.setStatus("Đang giao"); break;
                case "PENDING": ro.setStatus("Đang xử lý"); break;
                case "CONFIRMED": ro.setStatus("Đã xác nhận"); break;
                case "CANCELLED": ro.setStatus("Đã hủy"); break;
                default: ro.setStatus(o.getStatus().name()); break;
            }
            recentOrders.add(ro);
        }
        dto.setRecentOrders(recentOrders);

        // Get Top 5 books
        List<Object[]> topBooksResult = orderRepository.findTopSellingBooks(Order.Status.CANCELLED, PageRequest.of(0, 5));
        List<DashboardDto.TopBook> topBooks = new ArrayList<>();
        for (Object[] row : topBooksResult) {
            DashboardDto.TopBook tb = new DashboardDto.TopBook();
            tb.setTitle((String) row[0]);
            tb.setSold(((Number) row[1]).longValue());
            tb.setRevenue(formatCurrency(((Number) row[2]).longValue()));
            topBooks.add(tb);
        }
        dto.setTopBooks(topBooks);

        return ResponseEntity.ok(dto);
    }

    private String formatCurrency(Long amount) {
        NumberFormat format = NumberFormat.getInstance(Locale.forLanguageTag("vi-VN"));
        return format.format(amount) + "đ";
    }
}
