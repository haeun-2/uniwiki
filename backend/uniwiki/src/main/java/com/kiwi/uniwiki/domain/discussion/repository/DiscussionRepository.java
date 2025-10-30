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

import java.util.Optional;

public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {

    Page<Discussion> findAllByDocumentIdAndCode(Integer documentId, Code code, Pageable pageable);

    @Query("""
        SELECT d
        FROM Discussion d
        WHERE d.document.university.id = :universityId
        ORDER BY d.updatedAt DESC
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

    @Query("SELECT d FROM Discussion d " +
            "JOIN FETCH d.document doc " +
            "WHERE d.id = :discussionId")
    Optional<Discussion> findByIdWithDocument(@Param("discussionId") Integer discussionId);
}
