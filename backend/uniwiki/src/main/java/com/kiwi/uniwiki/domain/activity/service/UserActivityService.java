package com.kiwi.uniwiki.domain.activity.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.activity.dto.response.UserActivityResponseDTO;

import com.kiwi.uniwiki.domain.activity.repository.UserActivityRepository;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final DiscussionContentRepository discussionContentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    /**
     * 사용자의 문서 활동 조회
     */
    public PageResponse<UserActivityResponseDTO.UserDocumentActivityResponse> getUserDocumentActivities(
            Integer userId,
            Integer page,
            Integer size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));


        Page<Integer> documentIds = userActivityRepository.findDocumentsTargetIdsByUserId(userId, pageable);

        if (documentIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }


        Map<Integer, DocumentVersion> documentVersionMap = documentVersionRepository
                .findByIdsWithDocument(documentIds.getContent())
                .stream()
                .collect(Collectors.toMap(dv -> dv.getDocument().getId(), Function.identity()));


        return PageResponse.from(documentIds, documentId -> {
            DocumentVersion documentVersion = documentVersionMap.get(documentId);
            if (documentVersion == null) return null;

            Document document = documentVersion.getDocument();

            return new UserActivityResponseDTO.UserDocumentActivityResponse(
                    document.getId(),
                    document.getTitle(),
                    document.getUniversity().getName(),
                    documentVersion.getEditMemo(),
                    documentVersion.getPlusCount(),
                    documentVersion.getMinusCount(),
                    document.getUpdatedAt()
            );
        });
    }

    /**
     * 사용자의 토론 활동 조회
     */
    public PageResponse<UserActivityResponseDTO.UserDiscussionActivityResponse> getUserDiscussionActivities(
            Integer userId,
            Integer page,
            Integer size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));

        // Discussion의 targetId 조회
        Page<Integer> discussionIds = userActivityRepository.findDiscussionActivitiesByUserId(userId, pageable);

        if (discussionIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        // DiscussionContent 일괄 조회 후 Discussion ID로 매핑
        Map<Integer, DiscussionContent> discussionContentMap = discussionContentRepository
                .findByIdsWithDocument(discussionIds.getContent())
                .stream()
                .collect(Collectors.toMap(dc -> dc.getDiscussion().getId(), Function.identity()));

        return PageResponse.from(discussionIds, discussionId -> {
            DiscussionContent discussionContent = discussionContentMap.get(discussionId);
            if (discussionContent == null) return null;

            Discussion discussion = discussionContent.getDiscussion();

            return new UserActivityResponseDTO.UserDiscussionActivityResponse(
                    discussion.getId(),
                    discussion.getTitle(),
                    discussion.getDocument().getTitle(),
                    discussion.getUpdatedAt()
            );
        });
    }
}