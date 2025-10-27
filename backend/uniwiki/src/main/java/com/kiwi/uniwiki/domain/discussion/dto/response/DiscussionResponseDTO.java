package com.kiwi.uniwiki.domain.discussion.dto.response;

import com.kiwi.uniwiki.domain.discussion.entity.Discussion;
import lombok.AllArgsConstructor;
import lombok.Getter;

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

}
