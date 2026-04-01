package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.OrderDto;
import com.pthttmdt.bookstore.entity.*;
import com.pthttmdt.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto.Response createOrder(OrderDto.CreateRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Build order items & calculate total
        long subtotal = 0;
        List<OrderItem> orderItems = new java.util.ArrayList<>();

        for (OrderDto.ItemRequest itemReq : req.getItems()) {
            Book book = bookRepository.findById(itemReq.getBookId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sách ID: " + itemReq.getBookId()));

            if (book.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Sách \"" + book.getTitle() + "\" không đủ số lượng tồn kho!");
            }

            OrderItem item = OrderItem.builder()
                    .book(book)
                    .bookTitle(book.getTitle())
                    .bookAuthor(book.getAuthor())
                    .bookCoverUrl(book.getCoverUrl())
                    .price(book.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();

            // Decrease stock
            book.setStock(book.getStock() - itemReq.getQuantity());
            bookRepository.save(book);

            subtotal += book.getPrice() * itemReq.getQuantity();
            orderItems.add(item);
        }

        long shippingFee = subtotal >= 800000 ? 0 : 30000;
        long totalAmount = subtotal + shippingFee;

        // Generate order code
        long count = orderRepository.count() + 1;
        String orderCode = "ORD" + String.format("%03d", count);

        Order.PaymentMethod paymentMethod;
        try {
            paymentMethod = Order.PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase().replace(" ", "_"));
        } catch (Exception e) {
            paymentMethod = Order.PaymentMethod.COD;
        }

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .customerName(req.getCustomerName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .status(Order.Status.PENDING)
                .paymentMethod(paymentMethod)
                .note(req.getNote())
                .shippingFee(shippingFee)
                .discount(0L)
                .totalAmount(totalAmount)
                .build();

        order = orderRepository.save(order);

        // Link items to order
        Order finalOrder = order;
        orderItems.forEach(item -> item.setOrder(finalOrder));
        order.setItems(orderItems);
        order = orderRepository.save(order);

        return OrderDto.Response.fromEntity(order);
    }

    public List<OrderDto.Response> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(OrderDto.Response::fromEntity).toList();
    }

    public OrderDto.Response getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        // Only allow user's own order or admin
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này!");
        }

        return OrderDto.Response.fromEntity(order);
    }

    @Transactional
    public OrderDto.Response confirmReceived(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật đơn hàng này!");
        }

        if (order.getStatus() != Order.Status.DELIVERED) {
            throw new RuntimeException("Chỉ có thể xác nhận khi đơn hàng ở trạng thái đã giao!");
        }

        order.setStatus(Order.Status.RECEIVED);
        return OrderDto.Response.fromEntity(orderRepository.save(order));
    }

    // Admin
    public Page<OrderDto.Response> getAllOrders(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(OrderDto.Response::fromEntity);
    }

    @Transactional
    public OrderDto.Response updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (order.getStatus() == Order.Status.RECEIVED) {
            throw new RuntimeException("Đơn hàng đã được khách xác nhận nhận, không thể thay đổi trạng thái nữa!");
        }

        order.setStatus(Order.Status.valueOf(status.toUpperCase()));
        return OrderDto.Response.fromEntity(orderRepository.save(order));
    }
}
