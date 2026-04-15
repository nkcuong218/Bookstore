package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.AuthDto;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.repository.UserRepository;
import com.pthttmdt.bookstore.security.JwtUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;
    private final JavaMailSender mailSender;

    @Value("${app.security.google.client-id:}")
    private String googleClientId;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Transactional
    public AuthDto.RegisterResponse register(AuthDto.RegisterRequest req) {
        User existingUser = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (existingUser != null) {
            if (!Boolean.TRUE.equals(existingUser.getEmailVerified())) {
                sendVerificationEmail(existingUser);
                return new AuthDto.RegisterResponse("Email đã tồn tại nhưng chưa xác thực. Mình đã gửi lại email xác thực.");
            }

            throw new RuntimeException("Email đã được sử dụng!");
        }

        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime verificationExpiresAt = LocalDateTime.now().plusHours(24);

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(User.Role.CUSTOMER)
                .status(User.Status.ACTIVE)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationExpiresAt(verificationExpiresAt)
                .build();

        user = userRepository.save(user);
        sendVerificationEmail(user);
        return new AuthDto.RegisterResponse("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng!"));

        if (user.getStatus() == User.Status.BLOCKED) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa!");
        }

        // Admin không cần xác thực email, customer phải xác thực
        if (user.getRole() == User.Role.CUSTOMER && !Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư và bấm vào link xác thực.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }

        String token = jwtUtils.generateToken(user);
        return new AuthDto.AuthResponse(token, user);
    }

    @Transactional
    public AuthDto.SimpleResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token xác thực không hợp lệ!");
        }

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Link xác thực không hợp lệ hoặc đã hết hạn!"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new AuthDto.SimpleResponse("Tài khoản đã được xác thực trước đó.");
        }

        if (user.getEmailVerificationExpiresAt() != null && user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Link xác thực đã hết hạn! Vui lòng đăng ký lại hoặc yêu cầu gửi lại email xác thực.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        return new AuthDto.SimpleResponse("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
    }

    public AuthDto.AuthResponse loginWithGoogle(AuthDto.GoogleLoginRequest req) {
        GoogleUserInfo googleUserInfo = verifyGoogleIdToken(req.getIdToken());

        if (googleUserInfo.email == null || googleUserInfo.email.isBlank()) {
            throw new RuntimeException("Không lấy được email từ Google!");
        }

        if (!googleUserInfo.emailVerified) {
            throw new RuntimeException("Email Google chưa được xác thực!");
        }

        User user = userRepository.findByEmail(googleUserInfo.email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(resolveDisplayName(googleUserInfo))
                        .email(googleUserInfo.email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(User.Role.CUSTOMER)
                        .status(User.Status.ACTIVE)
                        .build()));

        if (user.getStatus() == User.Status.BLOCKED) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa!");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpiresAt(null);
            userRepository.save(user);
        }

        String token = jwtUtils.generateToken(user);
        return new AuthDto.AuthResponse(token, user);
    }

    @Transactional
    public AuthDto.SimpleResponse forgotPassword(AuthDto.ForgotPasswordRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
            throw new RuntimeException("Email không hợp lệ!");
        }

        String normalizedEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        // Không tiết lộ email có tồn tại hay không để tránh lộ dữ liệu tài khoản.
        if (user == null || user.getStatus() == User.Status.BLOCKED) {
            return new AuthDto.SimpleResponse("Nếu email tồn tại trong hệ thống, mình đã gửi hướng dẫn đặt lại mật khẩu.");
        }

        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        sendResetPasswordEmail(user);

        return new AuthDto.SimpleResponse("Nếu email tồn tại trong hệ thống, mình đã gửi hướng dẫn đặt lại mật khẩu.");
    }

    @Transactional
    public AuthDto.SimpleResponse resetPassword(AuthDto.ResetPasswordRequest req) {
        if (req == null || req.getToken() == null || req.getToken().isBlank()) {
            throw new RuntimeException("Token đặt lại mật khẩu không hợp lệ!");
        }

        User user = userRepository.findByPasswordResetToken(req.getToken().trim())
                .orElseThrow(() -> new RuntimeException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Link đặt lại mật khẩu đã hết hạn!");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        return new AuthDto.SimpleResponse("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
    }

    private void sendVerificationEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Không thể gửi email xác thực!");
        }

        user.setEmailVerificationToken(UUID.randomUUID().toString());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String verificationLink = frontendBaseUrl.replaceAll("/$", "") + "/verify-email?token=" + user.getEmailVerificationToken();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setFrom((mailFrom == null || mailFrom.isBlank()) ? "no-reply@bookstore.local" : mailFrom);
            message.setSubject("Xác thực tài khoản Bookstore");
            message.setText("Xin chào " + user.getFullName() + ",\n\n"
                    + "Vui lòng bấm vào link bên dưới để xác thực tài khoản Bookstore của bạn:\n"
                    + verificationLink + "\n\n"
                    + "Link có hiệu lực trong 24 giờ.\n\n"
                    + "Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.");
            mailSender.send(message);
        } catch (MailException e) {
            throw new RuntimeException("Không gửi được email xác thực. Vui lòng kiểm tra cấu hình SMTP!");
        }
    }

    private void sendResetPasswordEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank() || user.getPasswordResetToken() == null) {
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu!");
        }

        String resetLink = frontendBaseUrl.replaceAll("/$", "") + "/reset-password?token=" + user.getPasswordResetToken();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setFrom((mailFrom == null || mailFrom.isBlank()) ? "no-reply@bookstore.local" : mailFrom);
            message.setSubject("Đặt lại mật khẩu Bookstore");
            message.setText("Xin chào " + user.getFullName() + ",\n\n"
                    + "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Bookstore.\n"
                    + "Vui lòng bấm vào link bên dưới để đặt mật khẩu mới:\n"
                    + resetLink + "\n\n"
                    + "Link có hiệu lực trong 30 phút.\n\n"
                    + "Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.");
            mailSender.send(message);
        } catch (MailException e) {
            throw new RuntimeException("Không gửi được email đặt lại mật khẩu. Vui lòng kiểm tra cấu hình SMTP!");
        }
    }

    private GoogleUserInfo verifyGoogleIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new RuntimeException("Google token không hợp lệ!");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_TOKEN_INFO_URL + idToken))
                    .GET()
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Google token không hợp lệ hoặc đã hết hạn!");
            }

            JsonNode payload = objectMapper.readTree(response.body());
            String aud = payload.path("aud").asText("").trim();
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.trim().equals(aud)) {
                throw new RuntimeException("Google client không hợp lệ!");
            }

            GoogleUserInfo info = new GoogleUserInfo();
            info.email = payload.path("email").asText("").trim().toLowerCase();
            info.name = payload.path("name").asText("").trim();
            String verified = payload.path("email_verified").asText("false");
            info.emailVerified = "true".equalsIgnoreCase(verified);
            return info;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Đăng nhập Google thất bại!");
        }
    }

    private String resolveDisplayName(GoogleUserInfo info) {
        if (info.name != null && !info.name.isBlank()) {
            return info.name;
        }

        if (info.email != null && info.email.contains("@")) {
            return info.email.substring(0, info.email.indexOf('@'));
        }

        return "Google User";
    }

    private static class GoogleUserInfo {
        private String email;
        private String name;
        private boolean emailVerified;
    }
}
