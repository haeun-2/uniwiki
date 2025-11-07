package com.kiwi.uniwiki.domain.discussion.repository;

import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {

    @EntityGraph(attributePaths = "document")
    Page<Discussion> findAllByDocumentIdAndCodeAndIsDeletedFalse(Integer documentId, Code code, Pageable pageable);

    List<Discussion> findAllByDocumentIdAndCode(Integer documentId, Code code);

    @EntityGraph(attributePaths = "document")
    @Query("""
        SELECT d
        FROM Discussion d
        WHERE d.document.university.id = :universityId
        AND d.isDeleted = false
        """)
    Page<Discussion> findAllByUniversityId(@Param("universityId") Integer universityId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Discussion> findAndLockById(Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"document", "code"})
    Optional<Discussion> findWithDocumentAndLockById(Integer id);


    @Query("""
        SELECT DISTINCT d
        FROM Discussion d
        LEFT JOIN FETCH d.document
        LEFT JOIN FETCH d.creator
        LEFT JOIN FETCH d.code
        LEFT JOIN FETCH d.discussionContents dc
        LEFT JOIN FETCH dc.code
        WHERE d.id = :id
        ORDER BY dc.contentNumber ASC
    """)
    Optional<Discussion> findWithContentsById(@Param("id") Integer id);

    //종료가 안된것만 댓글이 최신에 달린 순으로
    @EntityGraph( attributePaths = {"code"})
    @Query("SELECT d FROM Discussion d WHERE d.code.id = 1 ORDER BY d.updatedAt ASC")
    Page<Discussion> findAllDiscussion(Pageable pageable);


}
