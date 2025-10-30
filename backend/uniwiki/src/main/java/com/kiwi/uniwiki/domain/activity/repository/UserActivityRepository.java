package com.kiwi.uniwiki.domain.activity.repository;

import com.kiwi.uniwiki.domain.activity.entity.UserActivity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Integer> {
    /**
     * 사용자의 문서 활동 조회 (삭제되지 않은 문서만)
     */
    @Query("SELECT ua FROM UserActivity ua " +
            "JOIN FETCH ua.code c " +
            "WHERE ua.user.id = :userId " +
            "AND c.name IN ('CREATE_DOCUMENT', 'EDIT_DOCUMENT') " +
            "AND EXISTS (SELECT 1 FROM Document d " +
            "           WHERE d.id = ua.targetId " +
            "           AND d.isDeleted = false)")
    List<UserActivity> findDocumentActivitiesByUserId(@Param("userId") Integer userId);

    /**
     * 사용자의 토론 활동 조회 (삭제되지 않은 토론만)
     */
    @Query("SELECT ua FROM UserActivity ua " +
            "JOIN FETCH ua.code c " +
            "WHERE ua.user.id = :userId " +
            "AND c.name IN ('CREATE_DISCUSSION', 'REPLY_DISCUSSION') " +
            "AND EXISTS (SELECT 1 FROM Discussion d " +
            "           WHERE d.id = ua.targetId " +
            "           AND d.isDeleted = false)")
    List<UserActivity> findDiscussionActivitiesByUserId(@Param("userId") Integer userId);
}
