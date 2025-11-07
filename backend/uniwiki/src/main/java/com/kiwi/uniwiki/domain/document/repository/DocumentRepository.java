package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.Document;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Integer> {

    /**
     * 아이디로 삭제되지 않은 문서 조회
     */
    Optional<Document> findByIdAndIsDeletedFalse(Integer id);

    /**
     * 제목으로 삭제되지 않은 문서 조회
     */
    Optional<Document> findByTitleAndIsDeletedFalse(String title);

    boolean existsByTitle(String title);

    Page<Document> findAllByUniversityIdAndIsDeletedFalse(Short universityId, Pageable pageable);

    Page<Document> findAllByCategoryId(Short categoryId, Pageable pageable);

    Page<Document> findAllByCategoryIdAndUniversityId(Short categoryId, Short universityId, Pageable pageable);

    @Query("SELECT d FROM Document d " +
            "JOIN FETCH d.university u " +
            "WHERE d.id = :documentId")
    Optional<Document> findByIdWithUniversity(@Param("documentId") Integer documentId);

}
