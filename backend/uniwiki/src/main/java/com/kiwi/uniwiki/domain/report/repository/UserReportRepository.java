package com.kiwi.uniwiki.domain.report.repository;

import com.kiwi.uniwiki.domain.report.entity.UserReport;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Integer> {


    // 신고당한 유저 ID를 페이징 처리해서 가져오기
    @Query("SELECT DISTINCT ur.reportedUser.id FROM UserReport ur ORDER BY ur.reportedUser.id")
    Page<Integer> findDistinctReportedUserIds(Pageable pageable);

    // 여러 유저의 신고 내역을 한 번에 조회 (IN 절 사용)
    @Query("SELECT ur FROM UserReport ur " +
            "JOIN FETCH ur.reportedUser " +
            "JOIN FETCH ur.reporter " +
            "JOIN FETCH ur.code " +
            "WHERE ur.reportedUser.id IN :reportedUserIds " +
            "ORDER BY ur.reportedUser.id, ur.createdAt DESC")
    List<UserReport> findByReportedUserIdIn(@Param("reportedUserIds") List<Integer> reportedUserIds);

    // 특정 유저의 PENDING 상태인 신고 조회
    @Query("SELECT ur FROM UserReport ur " +
            "WHERE ur.reportedUser.id = :reportedUserId " +
            "AND ur.code.id = :codeId " +
            "ORDER BY ur.createdAt DESC")
    List<UserReport> findPendingReportsByReportedUserId(
            @Param("reportedUserId") Integer reportedUserId,
            @Param("codeId") Short codeId
    );


}