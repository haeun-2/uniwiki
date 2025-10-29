package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Integer> {

    /**
     * 제목으로 문서 조회
     */
    Optional<Document> findByTitle(String title);

    boolean existsByTitle(String title);

    Page<Document> findAllByUniversityId(Short universityId, Pageable pageable);

    Page<Document> findAllByCategoryId(Short categoryId, Pageable pageable);

    Page<Document> findAllByCategoryIdAndUniversityId(Short categoryId, Short universityId, Pageable pageable);
}
