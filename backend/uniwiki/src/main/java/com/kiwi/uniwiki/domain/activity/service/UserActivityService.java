package com.kiwi.uniwiki.domain.activity.service;

import com.kiwi.uniwiki.domain.activity.dto.response.UserActivityResponseDTO;
import com.kiwi.uniwiki.domain.activity.entity.UserActivity;
import com.kiwi.uniwiki.domain.activity.repository.UserActivityRepository;
import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import com.kiwi.uniwiki.domain.discussion.repository.DiscussionRepository;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final DocumentRepository documentRepository;
    private final DiscussionRepository discussionRepository;

    /**
     * 사용자의 문서 활동 조회
     */
    public List<UserActivityResponseDTO.UserDocumentActivityResponse> getUserDocumentActivities(Integer userId) {

        List<UserActivity> activities =
                userActivityRepository.findDocumentActivitiesByUserId(userId);

        return activities.stream()
                .map(activity -> documentRepository.findByIdWithUniversity(activity.getTargetId())
                        .map(document -> UserActivityResponseDTO.UserDocumentActivityResponse.builder()
                                .documentId(document.getId())
                                .documentName(document.getTitle())
                                .universityName(document.getUniversity().getName())
                                .updateAt(document.getUpdatedAt())
                                .build())
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 토론 활동 조회
     */
    public List<UserActivityResponseDTO.UserDiscussionActivityResponse> getUserDiscussionActivities(Integer userId) {

        List<UserActivity> activities =
                userActivityRepository.findDiscussionActivitiesByUserId(userId);

        return activities.stream()
                .map(activity -> discussionRepository.findByIdWithDocument(activity.getTargetId())
                        .map(discussion -> UserActivityResponseDTO.UserDiscussionActivityResponse.builder()
                                .discussionId(discussion.getId())
                                .discussionName(discussion.getTitle())
                                .documentTitle(discussion.getDocument().getTitle())
                                .updateAt(discussion.getUpdatedAt())
                                .build())
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}