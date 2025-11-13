package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.Document;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Integer>, CustomDocumentRepository {

    /**
     * 아이디로 삭제되지 않은 문서 조회
     */
    Optional<Document> findByIdAndIsDeletedFalse(Integer id);

    /**
     * 제목으로 삭제되지 않은 문서 조회
     */
    Optional<Document> findByTitleAndIsDeletedFalse(String title);

    boolean existsByTitle(String title);

    List<Document> findAllByUniversityIdAndIsDeletedFalseOrderByTitleAsc(Short universityId);

    List<Document> findAllByCategoryIdOrderByTitleAsc(Short categoryId);

    List<Document> findAllByCategoryIdAndUniversityIdOrderByTitleAsc(Short categoryId, Short universityId);

    /**
     * 최근 수정 문서 10개 조회
     */
    List<Document> findTop10ByUniversityIdAndIsDeletedFalseOrderByUpdatedAtDesc(Short universityId);

    @Query("SELECT d FROM Document d " +
            "JOIN FETCH d.university u " +
            "WHERE d.id = :documentId")
    Optional<Document> findByIdWithUniversity(@Param("documentId") Integer documentId);

}
