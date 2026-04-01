package com.pthttmdt.bookstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class BookGenreJoinMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner migrateBookGenreJoinTable() {
        return args -> {
            try {
                jdbcTemplate.execute("""
                        CREATE TABLE IF NOT EXISTS book_genres (
                            book_id BIGINT NOT NULL,
                            genre_id BIGINT NOT NULL,
                            PRIMARY KEY (book_id, genre_id),
                            CONSTRAINT fk_book_genres_book FOREIGN KEY (book_id) REFERENCES books(id),
                            CONSTRAINT fk_book_genres_genre FOREIGN KEY (genre_id) REFERENCES genres(id)
                        )
                        """);

                // Check if genre column still exists before backfilling
                String checkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_NAME = 'books' AND COLUMN_NAME = 'genre'";
                Integer columnCount = jdbcTemplate.queryForObject(checkSql, Integer.class);
                
                if (columnCount != null && columnCount > 0) {
                    jdbcTemplate.execute("""
                            INSERT IGNORE INTO book_genres(book_id, genre_id)
                            SELECT b.id, g.id
                            FROM books b
                            JOIN genres g ON LOWER(TRIM(g.name)) = LOWER(TRIM(b.genre))
                            WHERE b.genre IS NOT NULL AND TRIM(b.genre) <> ''
                            """);
                }
            } catch (Exception ignored) {
                // Keep startup resilient for environments with different DB capabilities.
            }
        };
    }
}