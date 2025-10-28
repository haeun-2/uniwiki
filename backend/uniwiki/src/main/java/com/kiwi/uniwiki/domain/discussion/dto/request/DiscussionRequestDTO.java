package com.kiwi.uniwiki.domain.discussion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

public class DiscussionRequestDTO {

    @Getter
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "토론할 문서 ID는 필수입니다.")
        private Integer documentId;
        @NotBlank(message = "토론 제목은 필수입니다.")
        private String discussionTitle;
        @NotBlank(message = "토른 내용은 필수입니다.")
        private String discussionContent;

    }


}
