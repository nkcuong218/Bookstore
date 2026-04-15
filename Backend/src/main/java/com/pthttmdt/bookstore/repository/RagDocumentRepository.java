package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.RagDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {
    long countBySourceType(String sourceType);
}
