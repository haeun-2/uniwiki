package com.kiwi.uniwiki.domain.activity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserActivityResponseDTO {

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDiscussionActivityResponse {

        private Integer discussionId;
        private String discussionName;
        private String documentTitle;
        private LocalDateTime updateAt;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDocumentActivityResponse {
        private Integer documentId;
        private Integer documentVersionNumber;
        private String documentName;
        private String universityName;
        private String editMemo;
        private Integer plusCount;
        private Integer minusCount;
        private LocalDateTime updateAt;
    }
}
