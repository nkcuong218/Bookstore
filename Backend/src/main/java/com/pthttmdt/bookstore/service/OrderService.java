package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.OrderDto;
import com.pthttmdt.bookstore.entity.*;
import com.pthttmdt.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountCodeRepository userDiscountCodeRepository;

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
        DiscountUsageResult discountUsage = validateAndConsumeDiscountCodes(
            user,
            req.getProductDiscountCode(),
            req.getShippingDiscountCode(),
            subtotal,
            shippingFee
        );

        long shippingFeeAfterDiscount = Math.max(shippingFee - discountUsage.shippingDiscountAmount, 0L);
        long totalDiscount = discountUsage.productDiscountAmount + discountUsage.shippingDiscountAmount;
        long totalAmount = Math.max(subtotal - discountUsage.productDiscountAmount + shippingFeeAfterDiscount, 0L);

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
                .productDiscountCode(discountUsage.productDiscountCode)
                .shippingDiscountCode(discountUsage.shippingDiscountCode)
                .shippingFee(shippingFeeAfterDiscount)
                .discount(totalDiscount)
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

    private DiscountUsageResult validateAndConsumeDiscountCodes(
            User user,
            String productCodeRaw,
            String shippingCodeRaw,
            long subtotal,
            long shippingFee
    ) {
        String productCode = normalizeCode(productCodeRaw);
        String shippingCode = normalizeCode(shippingCodeRaw);

        Set<String> uniqueCodes = new LinkedHashSet<>();
        if (productCode != null) uniqueCodes.add(productCode);
        if (shippingCode != null) uniqueCodes.add(shippingCode);

        java.util.Map<String, DiscountCode> codeMap = new java.util.HashMap<>();

        for (String code : uniqueCodes) {
            DiscountCode discountCode = discountCodeRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã bị khóa: " + code));

            if (discountCode.getExpiresAt() != null && discountCode.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã giảm giá đã hết hạn: " + code);
            }

            UserDiscountCode userDiscountCode = userDiscountCodeRepository.findByUserAndDiscountCode(user, discountCode)
                    .orElseThrow(() -> new RuntimeException("Bạn chưa lưu mã giảm giá: " + code));

            if (userDiscountCode.getStatus() == UserDiscountCode.Status.USED) {
                throw new RuntimeException("Mã giảm giá đã được sử dụng: " + code);
            }

            userDiscountCode.setStatus(UserDiscountCode.Status.USED);
            userDiscountCode.setUsedAt(LocalDateTime.now());
            userDiscountCodeRepository.save(userDiscountCode);

            codeMap.put(code, discountCode);
        }

        long productDiscountAmount = 0L;
        if (productCode != null) {
            DiscountCode productCodeEntity = codeMap.get(productCode);
            if (productCodeEntity.getCategory() != DiscountCode.Category.PRODUCT) {
                throw new RuntimeException("Mã " + productCode + " không phải mã giảm giá sản phẩm");
            }
            if (subtotal < productCodeEntity.getMinOrder()) {
                throw new RuntimeException("Mã " + productCode + " yêu cầu đơn tối thiểu " + productCodeEntity.getMinOrder());
            }
            productDiscountAmount = calculateDiscount(productCodeEntity, subtotal);
        }

        long shippingDiscountAmount = 0L;
        if (shippingCode != null) {
            DiscountCode shippingCodeEntity = codeMap.get(shippingCode);
            if (shippingCodeEntity.getCategory() != DiscountCode.Category.SHIPPING) {
                throw new RuntimeException("Mã " + shippingCode + " không phải mã giảm phí vận chuyển");
            }
            if (shippingFee <= 0) {
                throw new RuntimeException("Đơn hàng đã miễn phí vận chuyển, không thể áp mã ship");
            }
            if (subtotal < shippingCodeEntity.getMinOrder()) {
                throw new RuntimeException("Mã " + shippingCode + " yêu cầu đơn tối thiểu " + shippingCodeEntity.getMinOrder());
            }
            shippingDiscountAmount = calculateDiscount(shippingCodeEntity, shippingFee);
        }

        DiscountUsageResult result = new DiscountUsageResult();
        result.productDiscountCode = productCode;
        result.shippingDiscountCode = shippingCode;
        result.productDiscountAmount = productDiscountAmount;
        result.shippingDiscountAmount = shippingDiscountAmount;
        return result;
    }

    private long calculateDiscount(DiscountCode code, long baseAmount) {
        if (baseAmount <= 0) {
            return 0L;
        }

        if (code.getType() == DiscountCode.Type.FIXED) {
            return Math.min(code.getValue(), baseAmount);
        }

        long calculated = Math.round((double) baseAmount * code.getValue() / 100.0);
        long capped = code.getMaxDiscount() == null ? calculated : Math.min(calculated, code.getMaxDiscount());
        return Math.min(capped, baseAmount);
    }

    private static class DiscountUsageResult {
        private String productDiscountCode;
        private String shippingDiscountCode;
        private long productDiscountAmount;
        private long shippingDiscountAmount;
    }

    private String normalizeCode(String rawCode) {
        if (rawCode == null) {
            return null;
        }

        String trimmed = rawCode.trim();
        return trimmed.isEmpty() ? null : trimmed.toUpperCase();
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
