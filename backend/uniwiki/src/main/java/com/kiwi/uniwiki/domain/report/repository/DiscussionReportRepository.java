package com.kiwi.uniwiki.domain.report.repository;

import com.kiwi.uniwiki.domain.report.entity.DiscussionReport;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DiscussionReportRepository extends JpaRepository<DiscussionReport, Integer> {


    // 토론 ID별로 그룹화 (페이징)
    @Query("SELECT DISTINCT dr.discussionContent.id FROM DiscussionReport dr ORDER BY dr.discussionContent.id")
    Page<Integer> findDistinctDiscussionContentIds(Pageable pageable);

    // 특정 토론의 모든 신고 내역 조회
    // 여러 토론의 신고 내역을 한 번에 조회 (IN 절)
    @Query("SELECT dr FROM DiscussionReport dr " +
            "JOIN FETCH dr.discussionContent " +
            "JOIN FETCH dr.reporter " +
            "JOIN FETCH dr.reportedUser " +
            "JOIN FETCH dr.code " +
            "WHERE dr.discussionContent.id IN :discussionContentIds " +
            "ORDER BY dr.discussionContent.id, dr.createdAt DESC")
    List<DiscussionReport> findByDiscussionContentIdIn(@Param("discussionContentIds") List<Integer> discussionContentIds);

    // PENDING 상태인 특정 토론의 신고 조회 (추가!)
    @Query("SELECT dr FROM DiscussionReport dr " +
            "JOIN FETCH dr.discussionContent " +
            "JOIN FETCH dr.reporter " +
            "JOIN FETCH dr.reportedUser " +
            "JOIN FETCH dr.code " +
            "WHERE dr.discussionContent.id = :discussionContentId " +
            "AND dr.code.id = :codeId " +
            "ORDER BY dr.createdAt DESC")
    List<DiscussionReport> findPendingReportsByDiscussionContentId(
            @Param("discussionContentId") Integer discussionContentId,
            @Param("codeId") Short codeId
    );
}
