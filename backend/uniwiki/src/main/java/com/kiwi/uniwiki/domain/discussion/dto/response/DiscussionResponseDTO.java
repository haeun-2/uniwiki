package com.kiwi.uniwiki.domain.discussion.dto.response;

import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DiscussionResponseDTO {

    @Getter
    @AllArgsConstructor
    public static class SimpleResponse {
        private Integer discussionId;
        private String discussionTitle;

        public static SimpleResponse from(Discussion discussion) {
            return new SimpleResponse(discussion.getId(), discussion.getTitle());
        }

        public static List<SimpleResponse> from(List<Discussion> discussions) {
            return discussions.stream().map(SimpleResponse::from).toList();
        }
    }

    @Getter
    @AllArgsConstructor
    public static class CreateResponse {
        private Integer discussionId;

        public static CreateResponse from(Discussion discussion) {
            return new CreateResponse(discussion.getId());
        }

    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Integer discussionId;
        private String documentTitle;
        private String discussionTitle;
        private String discussionStatus;
        private Integer creatorId;
        private String creatorNickname;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private List<DiscussionContentResponseDTO.Content> discussionContents;

        public static DetailResponse from(Discussion discussion) {
            return DetailResponse.builder()
                    .discussionId(discussion.getId())
                    .documentTitle(discussion.getDocument().getTitle())
                    .discussionTitle(discussion.getTitle())
                    .discussionStatus(discussion.getCode().getName())
                    .creatorId(discussion.getCreator().getId())
                    .creatorNickname(discussion.getCreator().getNickname())
                    .createdAt(discussion.getCreatedAt())
                    .updatedAt(discussion.getUpdatedAt())
                    .discussionContents(DiscussionContentResponseDTO.Content.from(discussion.getDiscussionContents()))
                    .build();

        }
    }
}
