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

import java.time.LocalDateTime;
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


        List<DocumentVersion> documentVersions = documentVersionRepository
                .findByIdsWithDocument(documentIds.getContent());


        List<UserActivityResponseDTO.UserDocumentActivityResponse> responses = documentVersions.stream()
                .map(documentVersion -> {
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
                })
                .collect(Collectors.toList());

        // Page 객체 생성 (원래의 페이징 정보 유지)
        Page<UserActivityResponseDTO.UserDocumentActivityResponse> responsePage =
                new PageImpl<>(responses, pageable, documentIds.getTotalElements());

        return PageResponse.from(responsePage);
    }

    /**
     * 사용자의 토론 활동 조회
     */
    public PageResponse<UserActivityResponseDTO.UserDiscussionActivityResponse> getUserDiscussionActivities(
            Integer userId,
            Integer page,
            Integer size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));



        Page<Integer> discussionIds = userActivityRepository.findDiscussionActivitiesByUserId(userId, pageable);



        if (discussionIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }


        List<DiscussionContent> discussionContents = discussionContentRepository
                .findByIdsWithDocument(discussionIds.getContent());




        List<UserActivityResponseDTO.UserDiscussionActivityResponse> responses = discussionContents.stream()
                .map(discussionContent -> {
                    Discussion discussion = discussionContent.getDiscussion();

                    return new UserActivityResponseDTO.UserDiscussionActivityResponse(
                            discussion.getId(),
                            discussion.getTitle(),
                            discussionContent.getDiscussion().getTitle(),
                            discussion.getUpdatedAt()
                    );
                })
                .collect(Collectors.toList());


        Page<UserActivityResponseDTO.UserDiscussionActivityResponse> responsePage =
                new PageImpl<>(responses, pageable, discussionIds.getTotalElements());

        return PageResponse.from(responsePage);
    }
}