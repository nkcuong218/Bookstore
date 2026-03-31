package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.repository.UserRepository;
import lombok.*;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // User: xem & cập nhật profile bản thân
    @GetMapping("/api/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/api/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody ProfileRequest req
    ) {
        user.setFullName(req.fullName != null ? req.fullName : user.getFullName());
        user.setPhone(req.phone != null ? req.phone : user.getPhone());
        user.setAddress(req.address != null ? req.address : user.getAddress());
        if (req.password != null && !req.password.isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password));
        }
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    // Admin: quản lý người dùng
    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDto> users = userRepository.findAll(PageRequest.of(page, size))
                .map(this::toDto);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/api/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        user.setStatus(user.getStatus() == User.Status.ACTIVE
                ? User.Status.BLOCKED : User.Status.ACTIVE);
        return ResponseEntity.ok(toDto(userRepository.save(user)));
    }

    @PatchMapping("/api/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(toDto(userRepository.save(user)));
    }

    @DeleteMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("Xóa người dùng thành công!");
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole().name().toLowerCase(),
                user.getStatus().name().toLowerCase(),
                user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate().toString() : null
        );
    }

    @Data
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String role;
        private String status;
        private String joinDate;
    }

    @Data
    public static class ProfileRequest {
        private String fullName;
        private String phone;
        private String address;
        private String password;
    }
}
