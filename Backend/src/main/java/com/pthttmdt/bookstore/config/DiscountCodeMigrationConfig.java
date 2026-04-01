package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class DiscountCodeMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateDiscountCodeSchema() {
        return args -> {
            try {
                jdbcTemplate.execute("""
                        CREATE TABLE IF NOT EXISTS discount_codes (
                            id BIGINT NOT NULL AUTO_INCREMENT,
                            code VARCHAR(255) NOT NULL,
                            name VARCHAR(255),
                            description VARCHAR(255),
                            category VARCHAR(50) NOT NULL,
                            type VARCHAR(50) NOT NULL,
                            value BIGINT NOT NULL,
                            min_order BIGINT NOT NULL,
                            max_discount BIGINT,
                            expires_at DATETIME(6),
                            active BIT NOT NULL,
                            created_at DATETIME(6),
                            updated_at DATETIME(6),
                            PRIMARY KEY (id),
                            UNIQUE KEY uk_discount_codes_code (code)
                        )
                        """);

                addColumnIfMissing("discount_codes", "name", "ALTER TABLE discount_codes ADD COLUMN name VARCHAR(255)");
                addColumnIfMissing("discount_codes", "description", "ALTER TABLE discount_codes ADD COLUMN description VARCHAR(255)");
                addColumnIfMissing("discount_codes", "category", "ALTER TABLE discount_codes ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'PRODUCT'");
                addColumnIfMissing("discount_codes", "type", "ALTER TABLE discount_codes ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'FIXED'");
                addColumnIfMissing("discount_codes", "value", "ALTER TABLE discount_codes ADD COLUMN value BIGINT NOT NULL DEFAULT 0");
                addColumnIfMissing("discount_codes", "min_order", "ALTER TABLE discount_codes ADD COLUMN min_order BIGINT NOT NULL DEFAULT 0");
                addColumnIfMissing("discount_codes", "max_discount", "ALTER TABLE discount_codes ADD COLUMN max_discount BIGINT");
                addColumnIfMissing("discount_codes", "expires_at", "ALTER TABLE discount_codes ADD COLUMN expires_at DATETIME(6)");

                jdbcTemplate.execute("""
                        CREATE TABLE IF NOT EXISTS user_discount_codes (
                            id BIGINT NOT NULL AUTO_INCREMENT,
                            user_id BIGINT NOT NULL,
                            discount_code_id BIGINT NOT NULL,
                            status VARCHAR(50) NOT NULL,
                            used_at DATETIME(6),
                            created_at DATETIME(6),
                            updated_at DATETIME(6),
                            PRIMARY KEY (id),
                            UNIQUE KEY uk_user_discount_code (user_id, discount_code_id),
                            CONSTRAINT fk_user_discount_codes_user FOREIGN KEY (user_id) REFERENCES users(id),
                            CONSTRAINT fk_user_discount_codes_code FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id)
                        )
                        """);

                addColumnIfMissing("orders", "product_discount_code", "ALTER TABLE orders ADD COLUMN product_discount_code VARCHAR(255)");
                addColumnIfMissing("orders", "shipping_discount_code", "ALTER TABLE orders ADD COLUMN shipping_discount_code VARCHAR(255)");
            } catch (Exception ignored) {
                // Keep startup resilient for environments with different DB capabilities.
            }
        };
    }

    private void addColumnIfMissing(String tableName, String columnName, String alterSql) {
        String checkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tableName, columnName);
        if (count == null || count == 0) {
            jdbcTemplate.execute(alterSql);
        }
    }
}
