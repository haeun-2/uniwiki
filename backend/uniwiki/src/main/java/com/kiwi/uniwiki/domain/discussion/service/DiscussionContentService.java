package com.kiwi.uniwiki.domain.discussion.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionContentRequestDTO;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscussionContentService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final DiscussionSseService discussionSseService;
    private final CodeService codeService;

    @Transactional
    public void closeDiscussion(Integer discussionId, User user) {
        updateDiscussionStatus(discussionId, user, "CLOSED");
    }

    @Transactional
    public void pauseDiscussion(Integer discussionId, User user) {
        updateDiscussionStatus(discussionId, user, "PAUSE");
    }

    @Transactional
    public void createDiscussionContent(DiscussionContentRequestDTO.CreateContentRequest request, Integer discussionId, User user) {
        Discussion discussion = discussionRepository.findWithDocumentAndLockById(discussionId).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));

        // open 토론인지 확인
        if (!discussion.isOpen()) {
            throw new CustomException(ErrorCode.DISCUSSION_NOT_OPEN);
        }

        // 토론 문서의 대학생인지 확인
        if (!user.getIsUniversityVerified() || !Objects.equals(user.getUniversity().getId(), discussion.getDocument().getUniversity().getId())) {
            throw new CustomException(ErrorCode.DISCUSSION_ACCESS_DENIED);
        }

        // 토론 메시지 생성
        DiscussionContent discussionContent = createDiscussionContent(discussion, user, request.getDiscussionContent(), "USER");

        // 새 토론 내용 이벤트 전송
        discussionSseService.sendDiscussionContent(discussionId, discussionContent);
    }

    private void updateDiscussionStatus(Integer discussionId, User user, String status) {
        Discussion discussion = discussionRepository.findAndLockById(discussionId).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));

        // 토론 생성자인지 확인
        if (!discussion.isCreatedBy(user)) {
            throw new CustomException(ErrorCode.DISCUSSION_STATUS_ACCESS_DENIED);
        }

        // 토론 상태 변경
        discussion.updateStatus(codeService.get("DISCUSSION_STATUS", status));

        // 토론 상태 변경 메시지 생성
        DiscussionContent discussionContent = createDiscussionContent(discussion, user, "토론 상태를 " + status + "로 변경함", "SYSTEM");

        // 상태 변경 이벤트 전송
        discussionSseService.sendDiscussionContent(discussionId, discussionContent);
        discussionSseService.sendDiscussionStatus(discussionId, status);
    }

    private DiscussionContent createDiscussionContent(Discussion discussion, User user, String content, String type) {
        DiscussionContent discussionContent = DiscussionContent.builder()
                .discussion(discussion)
                .creator(user)
                .content(content)
                .contentNumber(discussion.renewContentNumber())
                .code(codeService.get("DISCUSSION_TYPE", type))
                .build();
        return discussionContentRepository.save(discussionContent);
    }

}
