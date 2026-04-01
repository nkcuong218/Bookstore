package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.UserAddressDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.entity.UserAddress;
import com.pthttmdt.bookstore.repository.UserAddressRepository;
import com.pthttmdt.bookstore.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    public List<UserAddressDto.Response> getMyAddresses(Long userId) {
        return userAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(userId)
                .stream()
                .map(UserAddressDto.Response::fromEntity)
                .toList();
    }

    @Transactional
    public UserAddressDto.Response createAddress(Long userId, UserAddressDto.CreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        boolean isFirstAddress = !userAddressRepository.existsByUserId(userId);
        boolean shouldSetDefault = isFirstAddress || Boolean.TRUE.equals(req.getSetDefault());

        if (shouldSetDefault) {
            userAddressRepository.clearDefaultByUserId(userId);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(req.getRecipientName().trim())
                .phone(req.getPhone().trim())
                .addressLine(req.getAddressLine().trim())
                .ward(trimToNull(req.getWard()))
                .district(trimToNull(req.getDistrict()))
                .city(req.getCity().trim())
                .isDefault(shouldSetDefault)
                .build();

        UserAddress saved = userAddressRepository.save(address);

        if (shouldSetDefault) {
            user.setAddress(UserAddressDto.formatFullAddress(saved));
            userRepository.save(user);
        }

        return UserAddressDto.Response.fromEntity(saved);
    }

    @Transactional
    public UserAddressDto.Response setDefaultAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ!"));

        userAddressRepository.clearDefaultByUserId(userId);
        address.setIsDefault(true);
        UserAddress saved = userAddressRepository.save(address);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        user.setAddress(UserAddressDto.formatFullAddress(saved));
        userRepository.save(user);

        return UserAddressDto.Response.fromEntity(saved);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ!"));

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        userAddressRepository.delete(address);

        if (wasDefault) {
            List<UserAddress> remaining = userAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

            if (remaining.isEmpty()) {
                user.setAddress(null);
            } else {
                UserAddress nextDefault = remaining.get(0);
                userAddressRepository.clearDefaultByUserId(userId);
                nextDefault.setIsDefault(true);
                userAddressRepository.save(nextDefault);
                user.setAddress(UserAddressDto.formatFullAddress(nextDefault));
            }
            userRepository.save(user);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
