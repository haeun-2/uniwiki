package com.kiwi.uniwiki.domain.activity.service;

import com.kiwi.uniwiki.domain.activity.entity.UserActivity;
import com.kiwi.uniwiki.domain.activity.repository.UserActivityRepository;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AsyncUserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final CodeService codeService;

    @Async
    public void createDiscussionActivity(User user, DiscussionContent discussionContent, String codeName) {
        UserActivity userActivity = UserActivity.builder()
                .user(user)
                .targetId(discussionContent.getId())
                .createdAt(discussionContent.getCreatedAt())
                .code(codeService.get("USER_ACTIVITY_TYPE", codeName))
                .build();

        userActivityRepository.save(userActivity);
    }

    @Async
    public void createDocumentActivity(User user, DocumentVersion documentVersion, String codeName) {
        UserActivity userActivity = UserActivity.builder()
                .user(user)
                .targetId(documentVersion.getId())
                .createdAt(documentVersion.getCreatedAt())
                .code(codeService.get("USER_ACTIVITY_TYPE", codeName))
                .build();

        userActivityRepository.save(userActivity);
    }


}
