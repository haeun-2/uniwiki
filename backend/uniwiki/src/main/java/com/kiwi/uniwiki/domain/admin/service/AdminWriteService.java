package com.kiwi.uniwiki.domain.admin.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.admin.dto.request.AdminRequestDTO;
import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.report.entity.DiscussionReport;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.DiscussionReportRepository;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.entity.UserBan;
import com.kiwi.uniwiki.domain.user.repository.UserBanRepository;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cglib.core.Local;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminWriteService {

    private final UserReportRepository userReportRepository;
    private final CodeService codeService;
    private final UserBanRepository userBanRepository;
    private final UserRepository userRepository;
    private final DiscussionReportRepository discussionReportRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public void rejectUserReport(User admin, Integer reportedUserId, AdminRequestDTO.ReportRejectedRequest request){


        List<UserReport> pendingReports = userReportRepository.findPendingReportsByReportedUserId(
                reportedUserId,
                codeService.get("USER_REPORT_STATUS", "PENDING").getId()
        );

        if (pendingReports.isEmpty()) {
            throw new CustomException(ErrorCode.REPORT_NOT_FOUND);
        }



        Code rejectedCode = codeService.get("USER_REPORT_STATUS", "REJECTED");

        pendingReports.forEach(userReport ->
                userReport.reportProcess(admin, request.getReason(), rejectedCode)
        );

    }

    @Transactional
    public void resolvedReport(User admin, Integer reportedUserId, AdminRequestDTO.ReportSolvedRequest request) {


        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));


        List<UserReport> pendingReports = userReportRepository.findPendingReportsByReportedUserId(
                reportedUserId,
                codeService.get("USER_REPORT_STATUS", "PENDING").getId()
        );


        if (pendingReports.isEmpty()) {
            throw new CustomException(ErrorCode.REPORT_NOT_FOUND);
        }


        UserBan userBan = UserBan.builder()
                .user(reportedUser)
                .admin(admin)
                .userReport(pendingReports.get(0))
                .reason(request.getReason())
                .bannedUntil(request.getBanUntil())
                .build();

        userBanRepository.save(userBan);


        Code resolvedCode = codeService.get("USER_REPORT_STATUS", "RESOLVED");

        pendingReports.forEach(userReport ->
                userReport.reportProcess(admin, request.getReason(), resolvedCode)
        );
    }

    @Transactional
    public void rejectDiscussionReport(User admin, Integer reportedDiscussionId, AdminRequestDTO.ReportRejectedRequest request) {


        List<DiscussionReport> pendingReports = discussionReportRepository.findPendingReportsByDiscussionContentId(
                reportedDiscussionId,
                codeService.get("DISCUSSION_REPORT_STATUS", "PENDING").getId()
        );


        if (pendingReports.isEmpty()) {
            throw new CustomException(ErrorCode.REPORT_NOT_FOUND);
        }


        Code rejectedCode = codeService.get("DISCUSSION_REPORT_STATUS", "REJECTED");


        pendingReports.forEach(discussionReport ->
                discussionReport.reportProcess(admin, request.getReason(), rejectedCode)
        );
    }

    @Transactional
    public void resolvedDiscussionReport(User admin, Integer reportedDiscussionId, AdminRequestDTO.DiscussionReportSolvedRequest request) {


        DiscussionContent discussionContent = discussionContentRepository.findById(reportedDiscussionId)
                .orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_OPEN));

        List<DiscussionReport> pendingReports = discussionReportRepository.findPendingReportsByDiscussionContentId(
                reportedDiscussionId,
                codeService.get("DISCUSSION_REPORT_STATUS", "PENDING").getId()
        );


        if (pendingReports.isEmpty()) {
            throw new CustomException(ErrorCode.REPORT_NOT_FOUND);
        }

        discussionContent.maskContent();


        Code resolvedCode = codeService.get("DISCUSSION_REPORT_STATUS", "RESOLVED");

        pendingReports.forEach(discussionReport ->
                discussionReport.reportProcess(admin, request.getReason(), resolvedCode)
        );
    }

    @Transactional
    public void deleteDocument(AdminRequestDTO.DocumentDeleteRequest request, Integer documentId){
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));
        document.deleteDocument(request.getReason());

    }


}
