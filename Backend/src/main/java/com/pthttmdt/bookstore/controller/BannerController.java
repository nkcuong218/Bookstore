package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.BannerDto;
import com.pthttmdt.bookstore.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
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
    public ResponseEntity<BannerDto.BannerResponse> createBannerJson(
            @Valid @RequestBody BannerDto.CreateBannerRequest request) {
        return ResponseEntity.ok(bannerService.createBanner(request.getImageUrl(), null, request.getDisplayOrder()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDto.BannerResponse> createBannerUpload(
            @RequestParam(required = false) String imageUrl,
            @RequestPart(required = false) MultipartFile imageFile,
            @RequestParam Integer displayOrder) {
        return ResponseEntity.ok(bannerService.createBanner(imageUrl, imageFile, displayOrder));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDto.BannerResponse> updateBannerJson(
            @PathVariable Long id,
            @Valid @RequestBody BannerDto.UpdateBannerRequest request) {
        return ResponseEntity.ok(bannerService.updateBanner(id, request.getImageUrl(), null, request.getDisplayOrder()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDto.BannerResponse> updateBannerUpload(
            @PathVariable Long id,
            @RequestParam(required = false) String imageUrl,
            @RequestPart(required = false) MultipartFile imageFile,
            @RequestParam Integer displayOrder) {
        return ResponseEntity.ok(bannerService.updateBanner(id, imageUrl, imageFile, displayOrder));
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
