package com.kiwi.uniwiki.domain.discussion.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.activity.entity.UserActivity;
import com.kiwi.uniwiki.domain.activity.service.AsyncUserActivityService;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionRequestDTO;
import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionResponseDTO;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final DocumentRepository documentRepository;
    private final CodeService codeService;
    private final AsyncUserActivityService asyncUserActivityService;

    @Transactional
    public DiscussionResponseDTO.CreateResponse createDiscussion(DiscussionRequestDTO.CreateRequest request, User user) {
        Document document = documentRepository.findById(request.getDocumentId()).orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        // 유저가 토론 참여 권한을 가졌는지 확인
        validatePermission(user, document);

        // 토론 저장
        Discussion discussion = Discussion.builder()
                .document(document)
                .creator(user)
                .title(request.getDiscussionTitle())
                .code(codeService.get("DISCUSSION_STATUS", "OPEN"))
                .build();

        Discussion savedDiscussion = discussionRepository.save(discussion);

        // 토론 첫번째 내용 저장
        DiscussionContent discussionContent = DiscussionContent.builder()
                .discussion(savedDiscussion)
                .creator(user)
                .content(request.getDiscussionContent())
                .contentNumber(1)
                .code(codeService.get("DISCUSSION_TYPE", "USER"))
                .build();

        discussionContentRepository.save(discussionContent);
        
        // CREATE_DISCUSSION 활동 내역 저장
        asyncUserActivityService.createDiscussionActivity(user, discussionContent, "CREATE_DISCUSSION");

        return DiscussionResponseDTO.CreateResponse.from(savedDiscussion);
    }

    public PageResponse<DiscussionResponseDTO.SimpleResponse> getOpenDiscussionsByDocument(Integer documentId, Integer page, Integer size) {
        Page<Discussion> discussions = discussionRepository.findAllByDocumentIdAndCode(
                documentId,
                codeService.get("DISCUSSION_STATUS", "OPEN"),
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")))
        );

        return PageResponse.from(discussions, DiscussionResponseDTO.SimpleResponse::from);
    }

    public List<DiscussionResponseDTO.SimpleResponse> getRecentDiscussionsByUniversity(Integer universityId) {
        List<Discussion> discussions = discussionRepository.findAllByUniversityId(universityId, PageRequest.of(0, 10)).getContent();
        return DiscussionResponseDTO.SimpleResponse.from(discussions);
    }

    public DiscussionResponseDTO.DetailResponse getDiscussionDetail(Integer discussionId) {
        Discussion discussion = discussionRepository.findWithContentsById(discussionId).orElseThrow(() -> new CustomException(ErrorCode.DISCUSSION_NOT_FOUND));
        return DiscussionResponseDTO.DetailResponse.from(discussion);
    }

    private void validatePermission(User user, Document document) {
        if (!user.getIsUniversityVerified() || !Objects.equals(user.getUniversity().getId(), document.getUniversity().getId())) {
            throw new CustomException(ErrorCode.DISCUSSION_ACCESS_DENIED);
        }
    }

}
