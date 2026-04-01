package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class OrderStatusMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateOrderStatusEnum() {
        return args -> {
            // Ensure MySQL enum includes RECEIVED so customer confirm-received action can persist.
            String sql = "ALTER TABLE orders " +
                    "MODIFY COLUMN status ENUM('PENDING','CONFIRMED','SHIPPING','DELIVERED','RECEIVED','CANCELLED') " +
                    "NOT NULL DEFAULT 'PENDING'";

            try {
                jdbcTemplate.execute(sql);
            } catch (Exception ignored) {
                // Ignore migration failures to avoid blocking app startup in non-MySQL/test environments.
            }
        };
    }
}