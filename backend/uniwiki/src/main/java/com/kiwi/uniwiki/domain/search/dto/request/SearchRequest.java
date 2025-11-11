package com.kiwi.uniwiki.domain.search.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

public class SearchRequest {

    @Getter
    @AllArgsConstructor
    public static class Rag {
        @NotBlank(message = "질문은 필수입니다.")
        private String question;
    }

}
