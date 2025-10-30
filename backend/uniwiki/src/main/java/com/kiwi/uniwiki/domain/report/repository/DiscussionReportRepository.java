package com.kiwi.uniwiki.domain.report.repository;

import com.kiwi.uniwiki.domain.report.entity.DiscussionReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscussionReportRepository extends JpaRepository<DiscussionReport, Integer> {
}
