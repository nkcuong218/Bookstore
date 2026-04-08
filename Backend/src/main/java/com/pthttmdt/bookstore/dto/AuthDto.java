package com.pthttmdt.bookstore.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Họ tên không được trống")
        private String fullName;

        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được trống")
        private String email;

        @NotBlank(message = "Mật khẩu không được trống")
        @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
        private String password;

        private String phone;
    }

    @Data
    public static class LoginRequest {
        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được trống")
        private String email;

        @NotBlank(message = "Mật khẩu không được trống")
        private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        @NotBlank(message = "Google token không được trống")
        private String idToken;
    }

    @Data
    public static class RegisterResponse {
        private String message;

        public RegisterResponse(String message) {
            this.message = message;
        }
    }

    @Data
    public static class SimpleResponse {
        private String message;

        public SimpleResponse(String message) {
            this.message = message;
        }
    }

    @Data
    public static class AuthResponse {
        private String token;
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private String phone;
        private String address;

        public AuthResponse(String token, com.pthttmdt.bookstore.entity.User user) {
            this.token = token;
            this.id = user.getId();
            this.fullName = user.getFullName();
            this.email = user.getEmail();
            this.role = user.getRole().name().toLowerCase();
            this.phone = user.getPhone();
            this.address = user.getAddress();
        }
    }
}
