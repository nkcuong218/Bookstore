package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    Optional<Genre> findByNameIgnoreCase(String name);
    Optional<Genre> findBySlug(String slug);
    List<Genre> findByActiveTrueOrderByNameAsc();
}