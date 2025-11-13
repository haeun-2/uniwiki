package com.kiwi.uniwiki.domain.activity.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.activity.dto.response.UserActivityResponseDTO;

import com.kiwi.uniwiki.domain.activity.entity.UserActivity;
import com.kiwi.uniwiki.domain.activity.repository.UserActivityRepository;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionContentRepository;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
            User user,
            Integer page,
            Integer size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));

        Page<UserActivity> userActivities = userActivityRepository.findDocumentsTargetIdsByUserId(user.getId(), pageable);

        if (userActivities.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }


        List<Integer> documentVersionIds = userActivities.getContent().stream()
                .map(UserActivity::getTargetId)
                .collect(Collectors.toList());


        List<DocumentVersion> documentVersions = documentVersionRepository
                .findByIdsWithDocument(documentVersionIds);


        Map<Integer, DocumentVersion> versionMap = documentVersions.stream()
                .collect(Collectors.toMap(DocumentVersion::getId, Function.identity()));

        // 원래 순서대로 DTO 생성
        List<UserActivityResponseDTO.UserDocumentActivityResponse> responses = userActivities.getContent().stream()
                .map(userActivity -> {
                    DocumentVersion documentVersion = versionMap.get(userActivity.getTargetId());
                    if (documentVersion == null) {
                        return null; // 또는 적절한 처리
                    }

                    Document document = documentVersion.getDocument();

                    return new UserActivityResponseDTO.UserDocumentActivityResponse(
                            document.getId(),
                            document.getTitle(),
                            document.getUniversity().getName(),
                            documentVersion.getEditMemo(),
                            documentVersion.getPlusCount(),
                            documentVersion.getMinusCount(),
                            userActivity.getCreatedAt()
                    );
                })
                .filter(Objects::nonNull) // null 제거
                .collect(Collectors.toList());

        Page<UserActivityResponseDTO.UserDocumentActivityResponse> responsePage =
                new PageImpl<>(responses, pageable, userActivities.getTotalElements());

        return PageResponse.from(responsePage);
    }

    /**
     * 사용자의 토론 활동 조회
     */
    public PageResponse<UserActivityResponseDTO.UserDiscussionActivityResponse> getUserDiscussionActivities(
            User user,
            Integer page,
            Integer size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));



        Page<UserActivity> userActivities = userActivityRepository.findDiscussionActivitiesByUserId(user.getId(), pageable);



        if (userActivities.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        List<Integer> contentIds = userActivities.getContent().stream()
                .map(UserActivity::getTargetId)
                .collect(Collectors.toList());


        List<DiscussionContent> discussionContents = discussionContentRepository
                .findByIdsWithDocument(contentIds);


        Map<Integer, DiscussionContent> versionMap = discussionContents.stream()
                .collect(Collectors.toMap(DiscussionContent::getId, Function.identity()));

        List<UserActivityResponseDTO.UserDiscussionActivityResponse> responses = userActivities.getContent().stream()
                .map(userActivity -> {
                    DiscussionContent discussionContent = versionMap.get(userActivity.getTargetId());

                    return new UserActivityResponseDTO.UserDiscussionActivityResponse(
                            discussionContent.getDiscussion().getId(),
                            discussionContent.getDiscussion().getTitle(),
                            discussionContent.getDiscussion().getDocument().getTitle(),
                            userActivity.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());


        Page<UserActivityResponseDTO.UserDiscussionActivityResponse> responsePage =
                new PageImpl<>(responses, pageable, userActivities.getTotalElements());

        return PageResponse.from(responsePage);
    }


}