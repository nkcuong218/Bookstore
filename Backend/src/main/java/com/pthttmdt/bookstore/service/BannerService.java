package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.entity.Banner;
import com.pthttmdt.bookstore.dto.BannerDto;
import com.pthttmdt.bookstore.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    public List<BannerDto.BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(banner -> new BannerDto.BannerResponse(banner.getId(), banner.getImageUrl(), banner.getDisplayOrder()))
                .collect(Collectors.toList());
    }

    @Transactional
    public BannerDto.BannerResponse createBanner(String imageUrl, MultipartFile imageFile, Integer displayOrder) {
        Banner banner = Banner.builder()
                .imageUrl(resolveImageUrl(imageUrl, imageFile))
                .displayOrder(displayOrder)
                .build();
        
        Banner saved = bannerRepository.save(banner);
        return new BannerDto.BannerResponse(saved.getId(), saved.getImageUrl(), saved.getDisplayOrder());
    }

    @Transactional
    public BannerDto.BannerResponse updateBanner(Long id, String imageUrl, MultipartFile imageFile, Integer displayOrder) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));

        String resolvedImageUrl = resolveImageUrl(imageUrl, imageFile);
        if (resolvedImageUrl != null && !resolvedImageUrl.isBlank()) {
            banner.setImageUrl(resolvedImageUrl);
        }

        if (displayOrder != null) {
            banner.setDisplayOrder(displayOrder);
        }

        Banner updated = bannerRepository.save(banner);
        return new BannerDto.BannerResponse(updated.getId(), updated.getImageUrl(), updated.getDisplayOrder());
    }

    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new RuntimeException("Banner not found with id: " + id);
        }
        bannerRepository.deleteById(id);
    }

    @Transactional
    public void reorderBanners(List<BannerDto.ReorderRequest> reorderRequests) {
        for (BannerDto.ReorderRequest request : reorderRequests) {
            Banner banner = bannerRepository.findById(request.getBannerId())
                    .orElseThrow(() -> new RuntimeException("Banner not found with id: " + request.getBannerId()));
            banner.setDisplayOrder(request.getDisplayOrder());
            bannerRepository.save(banner);
        }
    }

    private String resolveImageUrl(String imageUrl, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            return saveImageFile(imageFile);
        }

        if (imageUrl != null && !imageUrl.isBlank()) {
            return imageUrl;
        }

        throw new RuntimeException("Banner image is required");
    }

    private String saveImageFile(MultipartFile imageFile) {
        try {
            String originalFilename = imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "banner.jpg";
            String extension = "jpg";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
                extension = originalFilename.substring(dotIndex + 1).toLowerCase();
            }

            Path uploadDir = Paths.get("uploads/banners");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = UUID.randomUUID() + "." + extension;
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(imageFile.getInputStream(), filePath);

            return "http://localhost:8080/uploads/banners/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu ảnh banner", e);
        }
    }
}
