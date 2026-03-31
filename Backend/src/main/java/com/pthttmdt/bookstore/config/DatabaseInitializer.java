package com.pthttmdt.bookstore.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Tự động thay đổi kiểu dữ liệu của cột cover_url và description sang LONGTEXT
            // để chứa được ảnh Base64 thay vì VARCHAR(255) mặc định
            jdbcTemplate.execute("ALTER TABLE books MODIFY cover_url LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE books MODIFY description LONGTEXT");
            System.out.println("✅ Hệ thống đã tự động cập nhật cột cover_url và description thành kiểu LONGTEXT thành công!");
        } catch (Exception e) {
            System.out.println("⚠️ Chú ý: Không thể tự động ALTER TABLE (có thể do quyền). Bạn hãy tự chạy thủ công nếu vẫn gặp lỗi Data truncation.");
        }
    }
}
