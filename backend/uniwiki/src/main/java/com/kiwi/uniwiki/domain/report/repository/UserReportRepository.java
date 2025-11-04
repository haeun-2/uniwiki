package com.kiwi.uniwiki.domain.report.repository;

import com.kiwi.uniwiki.domain.report.entity.UserReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Integer> {

    @Query("SELECT ur FROM UserReport ur ORDER BY ur.createdAt DESC")
    Page<UserReport> findAllUserReports(Pageable pageable);

}