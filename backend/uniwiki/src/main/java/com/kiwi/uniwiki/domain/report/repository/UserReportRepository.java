package com.kiwi.uniwiki.domain.report.repository;

import com.kiwi.uniwiki.domain.report.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserReportRepository extends JpaRepository<UserReport, Integer> {
}
