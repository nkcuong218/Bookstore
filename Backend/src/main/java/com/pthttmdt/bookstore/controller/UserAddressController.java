package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.UserAddressDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.service.UserAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class UserAddressController {

    private final UserAddressService userAddressService;

    @GetMapping
    public ResponseEntity<?> getMyAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userAddressService.getMyAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserAddressDto.CreateRequest req
    ) {
        try {
            return ResponseEntity.ok(userAddressService.createAddress(user.getId(), req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(userAddressService.setDefaultAddress(user.getId(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        try {
            userAddressService.deleteAddress(user.getId(), id);
            return ResponseEntity.ok("Xóa địa chỉ thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
