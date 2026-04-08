package com.pthttmdt.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderCode; // ORD001, ORD002...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Thông tin giao hàng (snapshot tại thời điểm đặt)
    private String customerName;
    private String email;
    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    private String paymentCheckoutUrl;
    @Lob
    private String paymentQrCode;
    private String paymentLinkId;
    private String paymentLinkStatus;

    private String note;

    private String productDiscountCode;
    private String shippingDiscountCode;

    private Long shippingFee = 0L;
    private Long discount = 0L;
    private Long totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING,      // Đang xử lý
        CONFIRMED,    // Đã xác nhận
        SHIPPING,     // Đang giao
        DELIVERED,    // Đã giao
        RECEIVED,     // Khách đã nhận hàng
        CANCELLED     // Đã hủy
    }

    public enum PaymentMethod {
        COD,           // Thanh toán khi nhận
        BANK_TRANSFER, // Chuyển khoản
        CREDIT_CARD,   // Thẻ tín dụng
        E_WALLET       // Ví điện tử
    }
}
