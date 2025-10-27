package com.kiwi.uniwiki.domain.discussion.repository;

import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {

    Page<Discussion> findAllByDocumentIdAndCode(Integer documentId, Code code, Pageable pageable);

    @Query("""
        SELECT d
        FROM Discussion d
        WHERE d.document.university.id = :universityId
        ORDER BY d.updatedAt DESC
        """)
    Page<Discussion> findAllByUniversityId(@Param("universityId") Integer universityId, Pageable pageable);

}
