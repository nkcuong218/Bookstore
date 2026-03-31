package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.WishlistItem;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

public class WishlistDto {

    @Data
    public static class AddRequest {
        @NotNull(message = "bookId không được để trống")
        private Long bookId;
    }

    @Data
    public static class ItemResponse {
        private Long id;
        private LocalDateTime addedAt;
        private BookDto.Response book;

        public static ItemResponse fromEntity(WishlistItem item) {
            ItemResponse res = new ItemResponse();
            res.id = item.getId();
            res.addedAt = item.getCreatedAt();
            res.book = BookDto.Response.fromEntity(item.getBook());
            return res;
        }
    }
}
