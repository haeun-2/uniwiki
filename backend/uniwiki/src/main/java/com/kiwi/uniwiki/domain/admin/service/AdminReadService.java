package com.kiwi.uniwiki.domain.admin.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminReadService {

    private final UserReportRepository userReportRepository;

    public PageResponse<AdminResponseDTO.UserReportResponse> getUserReports(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);


        Page<Integer> reportedUserIdsPage = userReportRepository.findDistinctReportedUserIds(pageable);

        List<Integer> reportedUserIds = reportedUserIdsPage.getContent();


        if (reportedUserIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }


        List<UserReport> reports = userReportRepository.findByReportedUserIdIn(reportedUserIds);


        Map<Integer, List<UserReport>> groupedReports = reports.stream()
                .collect(Collectors.groupingBy(
                        report -> report.getReportedUser().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));


        List<AdminResponseDTO.UserReportResponse> content = reportedUserIds.stream()
                .map(reportedUserId -> {
                    List<UserReport> userReports = groupedReports.get(reportedUserId);

                    if (userReports == null || userReports.isEmpty()) {
                        return null;
                    }


                    User reportedUser = userReports.get(0).getReportedUser();


                    List<AdminResponseDTO.UserReportValue> reportValueList = userReports.stream()
                            .map(report -> new AdminResponseDTO.UserReportValue(
                                    report.getId(),
                                    report.getCode().getName(),
                                    report.getReporter().getNickname(),
                                    report.getCreatedAt()
                            ))
                            .collect(Collectors.toList());

                    return new AdminResponseDTO.UserReportResponse(
                            reportedUserId,
                            reportedUser.getNickname(),
                            reportValueList
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());


        Page<AdminResponseDTO.UserReportResponse> resultPage =
                new PageImpl<>(content, pageable, reportedUserIdsPage.getTotalElements());

        return PageResponse.from(resultPage);
    }
}
