package com.kiwi.uniwiki.domain.discussion.dto.response;

import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

public class DiscussionContentResponseDTO {

    @Getter
    @Builder
    public static class Content {
         private Integer discussionContentId;
         private Integer contentNumber;
         private String type;
         private Integer writerId;
         private String writerNickname;
         private String discussionContent;
         private Boolean isCreator;
         private LocalDateTime createdAt;

        public static Content from(DiscussionContent discussionContent) {
            return Content.builder()
                    .discussionContentId(discussionContent.getId())
                    .contentNumber(discussionContent.getContentNumber())
                    .type(discussionContent.getCode().getName())
                    .writerId(discussionContent.getCreator().getId())
                    .writerNickname(discussionContent.getCreator().getNickname())
                    .discussionContent(discussionContent.getContent())
                    .isCreator(discussionContent.isCreatedByDiscussionCreator())
                    .createdAt(discussionContent.getCreatedAt())
                    .build();
        }

        public static List<Content> from(List<DiscussionContent> discussionContents) {
            return discussionContents.stream().map(Content::from).toList();
        }
    }

    @Getter
    @AllArgsConstructor
    public static class StatusChange {
        private String status;
    }

}
