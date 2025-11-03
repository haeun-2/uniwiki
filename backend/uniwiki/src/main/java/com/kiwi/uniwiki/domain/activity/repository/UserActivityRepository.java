package com.kiwi.uniwiki.domain.activity.repository;

import com.kiwi.uniwiki.domain.activity.entity.UserActivity;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;


@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Integer> {
    /**
     * 사용자의 문서 활동 조회 (삭제되지 않은 문서만)
     */
    @Query("SELECT ua.targetId FROM UserActivity ua " +
            "JOIN ua.code c " +
            "WHERE ua.user.id = :userId " +
            "AND c.name IN ('CREATE_DOCUMENT', 'EDIT_DOCUMENT')")
    Page<Integer> findDocumentsTargetIdsByUserId(
            @Param("userId") Integer userId,
            Pageable pageable);


    /**
     * 사용자의 토론 활동 조회 (삭제되지 않은 토론만)
     */
    @Query("SELECT ua.targetId FROM UserActivity ua " +
            "JOIN ua.code c " +
            "WHERE ua.user.id = :userId " +
            "AND c.name IN ('CREATE_DISCUSSION', 'REPLY_DISCUSSION')")
    Page<Integer> findDiscussionActivitiesByUserId(
            @Param("userId") Integer userId,
            Pageable pageable);
}

