package com.kiwi.uniwiki.domain.document.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class DocumentUpdateRequestDTO {

    @NotNull(message = "카테고리 선택은 필수입니다.")
    private Integer categoryId;

    private String documentContent;

    private String editMemo;
}
