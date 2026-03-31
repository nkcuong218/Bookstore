package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.WishlistDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistDto.ItemResponse>> getMyWishlist(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(wishlistService.getMyWishlist(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> addToWishlist(
            @Valid @RequestBody WishlistDto.AddRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(wishlistService.addToWishlist(user.getId(), req.getBookId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        try {
            wishlistService.removeFromWishlist(user.getId(), bookId);
            return ResponseEntity.ok("Xóa khỏi danh sách yêu thích thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/contains/{bookId}")
    public ResponseEntity<Map<String, Boolean>> contains(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        boolean exists = wishlistService.isInWishlist(user.getId(), bookId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @DeleteMapping
    public ResponseEntity<String> clearWishlist(@AuthenticationPrincipal User user) {
        wishlistService.clearWishlist(user.getId());
        return ResponseEntity.ok("Đã xóa toàn bộ danh sách yêu thích!");
    }
}
