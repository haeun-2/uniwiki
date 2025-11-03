package com.kiwi.uniwiki.domain.discussion.repository;

import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionContentRepository extends JpaRepository<DiscussionContent, Integer> {

    @Query("SELECT dc FROM DiscussionContent dc " +
            "JOIN FETCH dc.discussion d " +
            "JOIN FETCH d.document " +
            "WHERE dc.discussion.id IN :ids")
    List<DiscussionContent> findByIdsWithDocument(@Param("ids") List<Integer> ids);
}
