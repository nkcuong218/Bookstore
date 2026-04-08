package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.BannerDto;
import com.pthttmdt.bookstore.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Public endpoint - Get all banners
    @GetMapping
    public ResponseEntity<List<BannerDto.BannerResponse>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    // Admin endpoints
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDto.BannerResponse> createBanner(@Valid @RequestBody BannerDto.CreateBannerRequest request) {
        return ResponseEntity.ok(bannerService.createBanner(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDto.BannerResponse> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerDto.UpdateBannerRequest request) {
        return ResponseEntity.ok(bannerService.updateBanner(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderBanners(@Valid @RequestBody List<BannerDto.ReorderRequest> requests) {
        bannerService.reorderBanners(requests);
        return ResponseEntity.ok().build();
    }
}
