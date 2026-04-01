package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.DiscountCode;
import com.pthttmdt.bookstore.entity.UserDiscountCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class DiscountCodeDto {

    @Data
    public static class SaveCodeRequest {
        @NotBlank(message = "Mã giảm giá không được trống")
        private String code;
    }

    @Data
    public static class UpsertRequest {
        @NotBlank(message = "Mã giảm giá không được trống")
        private String code;

        @NotNull(message = "Thời hạn không được trống")
        private LocalDateTime expiresAt;

        private String description;

        @NotNull(message = "Loại danh mục không được trống")
        private DiscountCode.Category category;

        @NotNull(message = "Kiểu giảm giá không được trống")
        private DiscountCode.Type type;

        @NotNull(message = "Giá trị giảm không được trống")
        private Long value;

        private Long minOrder = 0L;
        private Long maxDiscount;
        private Boolean active = true;
    }

    @Data
    public static class AdminResponse {
        private Long id;
        private String code;
        private LocalDateTime expiresAt;
        private String description;
        private String category;
        private String type;
        private Long value;
        private Long minOrder;
        private Long maxDiscount;
        private Boolean active;
        private Long usedCount;
        private LocalDateTime createdAt;

        public static AdminResponse fromEntity(DiscountCode code, long usedCount) {
            AdminResponse res = new AdminResponse();
            res.id = code.getId();
            res.code = code.getCode();
            res.expiresAt = code.getExpiresAt();
            res.description = code.getDescription();
            res.category = code.getCategory() != null ? code.getCategory().name() : null;
            res.type = code.getType() != null ? code.getType().name() : null;
            res.value = code.getValue();
            res.minOrder = code.getMinOrder();
            res.maxDiscount = code.getMaxDiscount();
            res.active = code.getActive();
            res.usedCount = usedCount;
            res.createdAt = code.getCreatedAt();
            return res;
        }
    }

    @Data
    public static class CustomerResponse {
        private Long id;
        private String code;
        private LocalDateTime expiresAt;
        private String description;
        private String category;
        private String type;
        private Long value;
        private Long minOrder;
        private Long maxDiscount;
        private String status;
        private LocalDateTime usedAt;

        public static CustomerResponse fromEntity(UserDiscountCode userCode) {
            DiscountCode code = userCode.getDiscountCode();
            CustomerResponse res = new CustomerResponse();
            res.id = code.getId();
            res.code = code.getCode();
            res.expiresAt = code.getExpiresAt();
            res.description = code.getDescription();
            res.category = code.getCategory() != null ? code.getCategory().name() : null;
            res.type = code.getType() != null ? code.getType().name() : null;
            res.value = code.getValue();
            res.minOrder = code.getMinOrder();
            res.maxDiscount = code.getMaxDiscount();
            res.status = userCode.getStatus() != null ? userCode.getStatus().name() : null;
            res.usedAt = userCode.getUsedAt();
            return res;
        }
    }
}
