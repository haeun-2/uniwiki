package com.kiwi.uniwiki.domain.discussion.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionContentRequestDTO;
import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionContentResponseDTO;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscussionContentService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final CodeService codeService;

    @Transactional
    public DiscussionContentResponseDTO.Content closeDiscussion(Integer discussionId, User user) {
        return updateDiscussionStatus(discussionId, user, "CLOSED");
    }

    @Transactional
    public DiscussionContentResponseDTO.Content pauseDiscussion(Integer discussionId, User user) {
        return updateDiscussionStatus(discussionId, user, "PAUSE");
    }

    @Transactional
    public DiscussionContentResponseDTO.Content createDiscussionContent(DiscussionContentRequestDTO.CreateContentRequest request, Integer discussionId, User user) {
        Discussion discussion = discussionRepository.findWithDocumentAndLockById(discussionId).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));

        // 토론 문서의 대학생인지 확인
        if (!user.getIsUniversityVerified() || !user.getUniversity().getId().equals(discussion.getDocument().getUniversity().getId())) {
            throw new CustomException(ErrorCode.DISCUSSION_ACCESS_DENIED);
        }

        // 토론 메시지 생성
        DiscussionContent discussionContent = createDiscussionContent(discussion, user, request.getDiscussionContent(), "USER");

        return DiscussionContentResponseDTO.Content.from(discussionContent);
    }

    private DiscussionContentResponseDTO.Content updateDiscussionStatus(Integer discussionId, User user, String status) {
        Discussion discussion = discussionRepository.findAndLockById(discussionId).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));

        // 토론 생성자인지 확인
        if (!discussion.getCreator().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.DISCUSSION_STATUS_ACCESS_DENIED);
        }
        // 토론 상태 변경
        discussion.updateStatus(codeService.get("DISCUSSION_STATUS", status));

        // 토론 상태 변경 메시지 생성
        DiscussionContent discussionContent = createDiscussionContent(discussion, user, "토론 상태를 " + status + "로 변경함", "SYSTEM");

        return DiscussionContentResponseDTO.Content.from(discussionContent);
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
