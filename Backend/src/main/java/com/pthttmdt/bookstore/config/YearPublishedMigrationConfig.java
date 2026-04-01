package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class YearPublishedMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateAddYearPublished() {
        return args -> {
            try {
                // Check if column already exists
                String checkSql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_NAME = 'books' AND COLUMN_NAME = 'year_published'";
                Integer columnExists = jdbcTemplate.queryForObject(checkSql, Integer.class);
                
                if (columnExists == null || columnExists == 0) {
                    // Column doesn't exist, add it
                    String addColumnSql = "ALTER TABLE books ADD COLUMN year_published INT";
                    jdbcTemplate.execute(addColumnSql);
                }
            } catch (Exception ignored) {
                // Ignore if column already exists or in non-MySQL/test environments
            }
        };
    }
}
