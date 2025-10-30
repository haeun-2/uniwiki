package com.kiwi.uniwiki.domain.activity.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class UserActivityResponseDTO {

    @Getter
    @Builder
    public static class UserDocumentActivityResponse{

            private Integer documentId;
            private String documentName;
            private String universityName;
            private LocalDateTime updateAt;

    }

    @Getter
    @Builder
    public static class UserDiscussionActivityResponse{

        private Integer discussionId;
        private String discussionName;
        private String documentTitle;
        private LocalDateTime updateAt;

    }

}
