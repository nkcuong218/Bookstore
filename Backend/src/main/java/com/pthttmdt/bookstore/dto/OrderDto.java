package com.pthttmdt.bookstore.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class ItemRequest {
        @NotNull
        private Long bookId;
        @NotNull
        private Integer quantity;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Họ tên không được trống")
        private String customerName;

        @NotBlank(message = "Email không được trống")
        private String email;

        @NotBlank(message = "Số điện thoại không được trống")
        private String phone;

        @NotBlank(message = "Địa chỉ không được trống")
        private String address;

        private String paymentMethod = "COD";
        private String note;
        private String productDiscountCode;
        private String shippingDiscountCode;

        @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
        private List<ItemRequest> items;
    }

    @Data
    public static class ItemResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String bookCoverUrl;
        private Long price;
        private Integer quantity;
        private Long subtotal;
    }

    @Data
    public static class Response {
        private Long id;
        private String orderCode;
        private String customerName;
        private String email;
        private String phone;
        private String address;
        private String status;
        private String paymentMethod;
        private String note;
        private String productDiscountCode;
        private String shippingDiscountCode;
        private Long shippingFee;
        private Long discount;
        private Long totalAmount;
        private List<ItemResponse> items;
        private LocalDateTime createdAt;

        public static Response fromEntity(com.pthttmdt.bookstore.entity.Order order) {
            Response res = new Response();
            res.id = order.getId();
            res.orderCode = order.getOrderCode();
            res.customerName = order.getCustomerName();
            res.email = order.getEmail();
            res.phone = order.getPhone();
            res.address = order.getAddress();
            res.status = order.getStatus().name();
            res.paymentMethod = order.getPaymentMethod().name();
            res.note = order.getNote();
            res.productDiscountCode = order.getProductDiscountCode();
            res.shippingDiscountCode = order.getShippingDiscountCode();
            res.shippingFee = order.getShippingFee();
            res.discount = order.getDiscount();
            res.totalAmount = order.getTotalAmount();
            res.createdAt = order.getCreatedAt();

            if (order.getItems() != null) {
                res.items = order.getItems().stream().map(item -> {
                    ItemResponse ir = new ItemResponse();
                    ir.id = item.getId();
                    ir.bookId = item.getBook() != null ? item.getBook().getId() : null;
                    ir.bookTitle = item.getBookTitle();
                    ir.bookAuthor = item.getBookAuthor();
                    ir.bookCoverUrl = item.getBookCoverUrl();
                    ir.price = item.getPrice();
                    ir.quantity = item.getQuantity();
                    ir.subtotal = item.getSubtotal();
                    return ir;
                }).toList();
            }
            return res;
        }
    }
}
