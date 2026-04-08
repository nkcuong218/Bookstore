package com.pthttmdt.bookstore.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BannerDto {

    @Data
    public static class CreateBannerRequest {
        @NotBlank(message = "Image URL không được trống")
        private String imageUrl;

        @NotNull(message = "Display order không được trống")
        private Integer displayOrder;
    }

    @Data
    public static class UpdateBannerRequest {
        private String imageUrl;
        private Integer displayOrder;
    }

    @Data
    public static class BannerResponse {
        private Long id;
        private String imageUrl;
        private Integer displayOrder;

        public BannerResponse(Long id, String imageUrl, Integer displayOrder) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.displayOrder = displayOrder;
        }
    }

    @Data
    public static class ReorderRequest {
        @NotNull(message = "Banner ID không được trống")
        private Long bannerId;

        @NotNull(message = "Display order không được trống")
        private Integer displayOrder;
    }
}
