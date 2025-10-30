package com.kiwi.uniwiki.domain.report.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.report.entity.DiscussionReport;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.report.repository.DiscussionReportRepository;
import com.kiwi.uniwiki.domain.report.dto.request.ReportRequestDTO;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final UserReportRepository userReportRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final DiscussionReportRepository discussionReportRepository;
    private final CodeService codeService;

    @Transactional
    public void reportUser(ReportRequestDTO.CreateReport request, User user) {
        // 신고 대상 유저 조회
        User target = userRepository.findById(request.getTargetId()).orElseThrow(() -> new CustomException(ErrorCode.USER_FOUND_FOUND));
        
        // 신고 생성
        UserReport userReport = UserReport.builder()
                .reporter(user)
                .reportedUser(target)
                .reason(request.getReason())
                .code(codeService.get("USER_REPORT_STATUS", "PENDING"))
                .build();
        userReportRepository.save(userReport);
    }

    @Transactional
    public void reportDiscussionContent(ReportRequestDTO.CreateReport request, User user) {
        // 신고 대상 토론 내용 조회
        DiscussionContent target = discussionContentRepository.findById(request.getTargetId()).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));

        // 신고 생성
        DiscussionReport discussionReport = DiscussionReport.builder()
                .discussionContent(target)
                .reporter(user)
                .reportedUser(target.getCreator())
                .reason(request.getReason())
                .code(codeService.get("DISCUSSION_REPORT_STATUS", "PENDING"))
                .build();
        discussionReportRepository.save(discussionReport);
    }

}
