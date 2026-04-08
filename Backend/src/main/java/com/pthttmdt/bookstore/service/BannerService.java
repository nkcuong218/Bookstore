package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.entity.Banner;
import com.pthttmdt.bookstore.dto.BannerDto;
import com.pthttmdt.bookstore.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
    public BannerDto.BannerResponse createBanner(BannerDto.CreateBannerRequest request) {
        Banner banner = Banner.builder()
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder())
                .build();
        
        Banner saved = bannerRepository.save(banner);
        return new BannerDto.BannerResponse(saved.getId(), saved.getImageUrl(), saved.getDisplayOrder());
    }

    @Transactional
    public BannerDto.BannerResponse updateBanner(Long id, BannerDto.UpdateBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));

        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            banner.setImageUrl(request.getImageUrl());
        }

        if (request.getDisplayOrder() != null) {
            banner.setDisplayOrder(request.getDisplayOrder());
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
}
