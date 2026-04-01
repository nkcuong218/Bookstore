package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Configuration
@RequiredArgsConstructor
public class GenreTableMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateGenresTable() {
        return args -> {
            try {
                jdbcTemplate.execute("""
                        CREATE TABLE IF NOT EXISTS genres (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(120) NOT NULL UNIQUE,
                            slug VARCHAR(150) NOT NULL UNIQUE,
                            description TEXT NULL,
                            active TINYINT(1) NOT NULL DEFAULT 1,
                            created_at DATETIME NOT NULL,
                            updated_at DATETIME NOT NULL
                        )
                        """);

                List<String> distinctGenres = jdbcTemplate.queryForList(
                        "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND TRIM(genre) <> ''",
                        String.class
                );

                String insertSql = "INSERT INTO genres(name, slug, active, created_at, updated_at) VALUES(?, ?, 1, NOW(), NOW()) " +
                        "ON DUPLICATE KEY UPDATE updated_at = NOW()";

                for (String genreName : distinctGenres) {
                    String cleaned = genreName.trim();
                    if (cleaned.isEmpty()) continue;
                    jdbcTemplate.update(insertSql, cleaned, toSlug(cleaned));
                }
            } catch (Exception ignored) {
                // Keep startup resilient when DB permissions/environments differ.
            }
        };
    }

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "genre" : normalized;
    }
}