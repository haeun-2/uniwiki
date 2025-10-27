package com.kiwi.uniwiki.domain.discussion.repository;

import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscussionContentRepository extends JpaRepository<DiscussionContent, Integer> {
}
