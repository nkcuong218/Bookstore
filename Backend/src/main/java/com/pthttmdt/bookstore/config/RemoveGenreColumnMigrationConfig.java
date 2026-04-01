package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class RemoveGenreColumnMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateRemoveGenreColumn() {
        return args -> {
            try {
                // Check if column still exists
                String checkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_NAME = 'books' AND COLUMN_NAME = 'genre'";
                Integer columnCount = jdbcTemplate.queryForObject(checkSql, Integer.class);
                
                if (columnCount != null && columnCount > 0) {
                    // Column exists, drop it
                    String dropColumnSql = "ALTER TABLE books DROP COLUMN genre";
                    jdbcTemplate.execute(dropColumnSql);
                }
            } catch (Exception ignored) {
                // Ignore if column doesn't exist or in non-MySQL/test environments
            }
        };
    }
}
