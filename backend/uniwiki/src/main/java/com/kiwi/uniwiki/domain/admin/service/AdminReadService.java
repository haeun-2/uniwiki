package com.kiwi.uniwiki.domain.admin.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.report.entity.DiscussionReport;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.DiscussionReportRepository;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.entity.UserBan;
import com.kiwi.uniwiki.domain.user.repository.UserBanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminReadService {

    private final UserReportRepository userReportRepository;
    private final DiscussionReportRepository discussionReportRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DiscussionRepository discussionRepository;
    private final UserBanRepository userBanRepository;
    private final DiscussionContentRepository discussionContentRepository;

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
                                    report.getReason(),
                                    report.getCreatedAt()

                            ))
                            .collect(Collectors.toList());

                    //이 유저가 차단됬는지 확인
                    //-> 차단을 했다면 제일 긴 차단이 날짜 넣기
                    Optional<UserBan> userBan = userBanRepository.findActiveBanByUserId(reportedUser.getId(), LocalDateTime.now());

                    return new AdminResponseDTO.UserReportResponse(
                            reportedUserId,
                            reportedUser.getNickname(),

                            !userBan.isEmpty() ? userBan.get().getBannedUntil() : null,
                            reportValueList
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 5. Page 객체 생성 및 반환
        Page<AdminResponseDTO.UserReportResponse> resultPage =
                new PageImpl<>(content, pageable, reportedUserIdsPage.getTotalElements());

        return PageResponse.from(resultPage);
    }

    public PageResponse<AdminResponseDTO.DiscussionReportResponse> getDiscussionReports(Integer page, Integer size) {

        Pageable pageable = PageRequest.of(page, size);


        Page<Integer> reportedDiscussionContentIdsPage =
                discussionReportRepository.findDistinctDiscussionContentIds(pageable);

        List<Integer> reportedDiscussionIds = reportedDiscussionContentIdsPage.getContent();

        if (reportedDiscussionIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }


        List<DiscussionReport> reports =
                discussionReportRepository.findByDiscussionContentIdIn(reportedDiscussionIds);


        Map<Integer, List<DiscussionReport>> groupedReports = reports.stream()
                .collect(Collectors.groupingBy(
                        report -> report.getDiscussionContent().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));


        List<AdminResponseDTO.DiscussionReportResponse> content = reportedDiscussionIds.stream()
                .map(reportedDiscussionId -> {
                    List<DiscussionReport> discussionReports = groupedReports.get(reportedDiscussionId);

                    if (discussionReports == null || discussionReports.isEmpty()) {
                        return null;
                    }

                    DiscussionContent discussionContent = discussionReports.get(0).getDiscussionContent();

                    List<AdminResponseDTO.DiscussionReportValue> reportValueList = discussionReports.stream()
                            .map(discussion -> new AdminResponseDTO.DiscussionReportValue(
                                    discussion.getId(),
                                    discussion.getReporter().getNickname(),
                                    discussion.getReason(),
                                    discussion.getCode().getName(),
                                    discussion.getCreatedAt()
                            ))
                            .collect(Collectors.toList());

                    return new AdminResponseDTO.DiscussionReportResponse(
                            reportedDiscussionId,
                            discussionContent.getDiscussion().getId(),
                            discussionContent.getDiscussion().getDocument().getUniversity().getName(),
                            discussionContent.getDiscussion().getDocument().getTitle(),
                            reportValueList
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());


        Page<AdminResponseDTO.DiscussionReportResponse> resultPage =
                new PageImpl<>(content, pageable, reportedDiscussionContentIdsPage.getTotalElements());

        return PageResponse.from(resultPage);
    }

    public PageResponse<AdminResponseDTO.DocumentVersionList> getDocumentAllVersions(int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentVersion> documentVersions = documentVersionRepository.findAllDocumentVersion(pageable);

        Page<AdminResponseDTO.DocumentVersionList> resultPage = documentVersions.map(dv ->
                new AdminResponseDTO.DocumentVersionList(
                        dv.getDocument().getUniversity().getName(),
                        dv.getDocument().getCategory().getName(),
                        dv.getDocument().getTitle(),
                        dv.getCreatedAt(),
                        dv.getPlusCount(),
                        dv.getMinusCount()
                )
        );

        return PageResponse.from(resultPage);
    }

    public PageResponse<AdminResponseDTO.DiscussionList> getAllDiscussion(int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        Page<Discussion> discussions = discussionRepository.findAllDiscussion(pageable);

        Page<AdminResponseDTO.DiscussionList> resultPage = discussions.map(d ->
                new AdminResponseDTO.DiscussionList(
                        d.getId(),
                        d.getTitle(),
                        d.getCode().getName(),
                        d.getUpdatedAt()
                )
        );

        return PageResponse.from(resultPage);
    }

    public AdminResponseDTO.DiscussionContentValue getDiscussionContent(Integer discussionId){

        DiscussionContent content = discussionContentRepository.findByIdWithDocument(discussionId);

        AdminResponseDTO.DiscussionContentValue result = AdminResponseDTO.DiscussionContentValue.builder().
                discussionContentId(content.getId())
                .discussionId(content.getDiscussion().getId())
                .discussionTitle(content.getDiscussion().getTitle())
                .discussionContent(content.getContent())
                .createdAt(content.getCreatedAt())
                .build();

        return result;

    }
}