package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.UserAddress;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

public class UserAddressDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Tên người nhận không được trống")
        private String recipientName;

        @NotBlank(message = "Số điện thoại không được trống")
        private String phone;

        @NotBlank(message = "Địa chỉ không được trống")
        private String addressLine;

        private String ward;
        private String district;

        @NotBlank(message = "Tỉnh/Thành phố không được trống")
        private String city;

        private Boolean setDefault = true;
    }

    @Data
    public static class Response {
        private Long id;
        private String recipientName;
        private String phone;
        private String addressLine;
        private String ward;
        private String district;
        private String city;
        private String fullAddress;
        private Boolean isDefault;
        private LocalDateTime createdAt;

        public static Response fromEntity(UserAddress entity) {
            Response res = new Response();
            res.id = entity.getId();
            res.recipientName = entity.getRecipientName();
            res.phone = entity.getPhone();
            res.addressLine = entity.getAddressLine();
            res.ward = entity.getWard();
            res.district = entity.getDistrict();
            res.city = entity.getCity();
            res.fullAddress = formatFullAddress(entity);
            res.isDefault = entity.getIsDefault();
            res.createdAt = entity.getCreatedAt();
            return res;
        }
    }

    public static String formatFullAddress(UserAddress entity) {
        return java.util.stream.Stream.of(
                        entity.getAddressLine(),
                        entity.getWard(),
                        entity.getDistrict(),
                        entity.getCity()
                )
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .collect(java.util.stream.Collectors.joining(", "));
    }
}
