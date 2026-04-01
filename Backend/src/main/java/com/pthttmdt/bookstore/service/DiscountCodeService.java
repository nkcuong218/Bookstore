package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.DiscountCodeDto;
import com.pthttmdt.bookstore.entity.DiscountCode;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.entity.UserDiscountCode;
import com.pthttmdt.bookstore.repository.DiscountCodeRepository;
import com.pthttmdt.bookstore.repository.UserDiscountCodeRepository;
import com.pthttmdt.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountCodeRepository userDiscountCodeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DiscountCodeDto.CustomerResponse> getMyDiscountCodes(Long userId) {
        return userDiscountCodeRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DiscountCodeDto.CustomerResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiscountCodeDto.AdminResponse> getAvailableCodes() {
        return discountCodeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(code -> Boolean.TRUE.equals(code.getActive()))
                .filter(code -> code.getExpiresAt() == null || code.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(code -> DiscountCodeDto.AdminResponse.fromEntity(code, 0))
                .toList();
    }

    @Transactional
    public DiscountCodeDto.CustomerResponse saveCodeForUser(Long userId, String rawCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String code = normalizeCode(rawCode);
        if (code == null) {
            throw new RuntimeException("Mã giảm giá không hợp lệ!");
        }

        DiscountCode discountCode = discountCodeRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã bị khóa!"));

        if (discountCode.getExpiresAt() != null && discountCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn!");
        }

        UserDiscountCode userDiscountCode = userDiscountCodeRepository.findByUserAndDiscountCode(user, discountCode)
                .orElseGet(() -> userDiscountCodeRepository.save(
                        UserDiscountCode.builder()
                                .user(user)
                                .discountCode(discountCode)
                                .status(UserDiscountCode.Status.ASSIGNED)
                                .build()
                ));

        return DiscountCodeDto.CustomerResponse.fromEntity(userDiscountCode);
    }

    @Transactional(readOnly = true)
    public List<DiscountCodeDto.AdminResponse> getAllCodesForAdmin() {
        return discountCodeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(code -> DiscountCodeDto.AdminResponse.fromEntity(
                        code,
                        userDiscountCodeRepository.countByDiscountCodeIdAndStatus(code.getId(), UserDiscountCode.Status.USED)
                ))
                .toList();
    }

    @Transactional
    public DiscountCodeDto.AdminResponse createCode(DiscountCodeDto.UpsertRequest req) {
        String code = normalizeCode(req.getCode());
        if (code == null) {
            throw new RuntimeException("Mã giảm giá không hợp lệ!");
        }

        if (discountCodeRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại!");
        }

        DiscountCode created = discountCodeRepository.save(DiscountCode.builder()
                .code(code)
            .name(code)
                .description(req.getDescription())
                .category(req.getCategory())
                .type(req.getType())
                .value(req.getValue())
                .minOrder(req.getMinOrder() == null ? 0L : req.getMinOrder())
                .maxDiscount(req.getMaxDiscount())
            .expiresAt(req.getExpiresAt())
                .active(req.getActive() == null || req.getActive())
                .build());

        return DiscountCodeDto.AdminResponse.fromEntity(created, 0);
    }

    @Transactional
    public DiscountCodeDto.AdminResponse updateCode(Long id, DiscountCodeDto.UpsertRequest req) {
        DiscountCode existing = discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá!"));

        String code = normalizeCode(req.getCode());
        if (code == null) {
            throw new RuntimeException("Mã giảm giá không hợp lệ!");
        }

        discountCodeRepository.findByCodeIgnoreCase(code)
                .filter(item -> !item.getId().equals(id))
                .ifPresent(item -> {
                    throw new RuntimeException("Mã giảm giá đã tồn tại!");
                });

        existing.setCode(code);
        existing.setName(code);
        existing.setDescription(req.getDescription());
        existing.setCategory(req.getCategory());
        existing.setType(req.getType());
        existing.setValue(req.getValue());
        existing.setMinOrder(req.getMinOrder() == null ? 0L : req.getMinOrder());
        existing.setMaxDiscount(req.getMaxDiscount());
        existing.setExpiresAt(req.getExpiresAt());
        existing.setActive(req.getActive() == null || req.getActive());

        DiscountCode saved = discountCodeRepository.save(existing);
        long usedCount = userDiscountCodeRepository.countByDiscountCodeIdAndStatus(saved.getId(), UserDiscountCode.Status.USED);
        return DiscountCodeDto.AdminResponse.fromEntity(saved, usedCount);
    }

    @Transactional
    public DiscountCodeDto.AdminResponse toggleCodeStatus(Long id) {
        DiscountCode existing = discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá!"));

        existing.setActive(!Boolean.TRUE.equals(existing.getActive()));
        DiscountCode saved = discountCodeRepository.save(existing);
        long usedCount = userDiscountCodeRepository.countByDiscountCodeIdAndStatus(saved.getId(), UserDiscountCode.Status.USED);
        return DiscountCodeDto.AdminResponse.fromEntity(saved, usedCount);
    }

    private String normalizeCode(String rawCode) {
        if (rawCode == null) {
            return null;
        }

        String trimmed = rawCode.trim();
        return trimmed.isEmpty() ? null : trimmed.toUpperCase();
    }
}
