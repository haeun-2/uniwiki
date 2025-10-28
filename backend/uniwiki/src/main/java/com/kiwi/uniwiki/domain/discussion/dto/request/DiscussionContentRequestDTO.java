package com.kiwi.uniwiki.domain.discussion.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

public class DiscussionContentRequestDTO {

    @Getter
    @AllArgsConstructor
    public static class CreateContentRequest {

        @NotBlank(message = "토론 의견은 필수입니다.")
        private String discussionContent;

    }

}
