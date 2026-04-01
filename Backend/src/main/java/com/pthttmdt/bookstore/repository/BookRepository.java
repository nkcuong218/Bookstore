package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN b.genres g WHERE " +
           "(:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:genre IS NULL OR LOWER(g.name) = LOWER(:genre))")
    Page<Book> findWithFilters(@Param("keyword") String keyword, @Param("genre") String genre, Pageable pageable);

    List<Book> findTop8ByOrderByRatingDesc();

       @Query("SELECT DISTINCT g.name FROM Book b JOIN b.genres g ORDER BY g.name")
    List<String> findDistinctGenres();
}
