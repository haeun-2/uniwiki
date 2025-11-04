package com.kiwi.uniwiki.domain.admin.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminReadService {

    private final UserReportRepository userReportRepository;

    public PageResponse<AdminResponseDTO.UserReportResponse> getUserReports(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));
        Page<UserReport> userReports = userReportRepository.findAllUserReports(pageable);

        return PageResponse.from(userReports, userReport ->
                new AdminResponseDTO.UserReportResponse(
                        userReport.getId(),
                        userReport.getCode().getName(),
                        userReport.getReporter().getNickname(),
                        userReport.getReportedUser().getNickname(),
                        userReport.getCreatedAt()
                )
        );
    }
}
