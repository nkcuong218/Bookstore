package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.DiscountCodeDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.service.DiscountCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;

    @GetMapping("/my")
    public ResponseEntity<?> getMyDiscountCodes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(discountCodeService.getMyDiscountCodes(user.getId()));
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCodes() {
        return ResponseEntity.ok(discountCodeService.getAvailableCodes());
    }

    @PostMapping("/my/save")
    public ResponseEntity<?> saveCodeForMe(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DiscountCodeDto.SaveCodeRequest req
    ) {
        try {
            return ResponseEntity.ok(discountCodeService.saveCodeForUser(user.getId(), req.getCode()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllForAdmin() {
        return ResponseEntity.ok(discountCodeService.getAllCodesForAdmin());
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCode(@Valid @RequestBody DiscountCodeDto.UpsertRequest req) {
        try {
            return ResponseEntity.ok(discountCodeService.createCode(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCode(@PathVariable Long id, @Valid @RequestBody DiscountCodeDto.UpsertRequest req) {
        try {
            return ResponseEntity.ok(discountCodeService.updateCode(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleCodeStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(discountCodeService.toggleCodeStatus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
