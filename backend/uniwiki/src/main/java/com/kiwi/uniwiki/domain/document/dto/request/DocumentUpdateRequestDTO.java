package com.kiwi.uniwiki.domain.document.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DocumentUpdateRequestDTO {

    @NotNull(message = "기존 버전 번호는 필수입니다.")
    private Integer baseVersionNumber;

    @NotNull(message = "카테고리 선택은 필수입니다.")
    private Short categoryId;

    private String documentContent;

    @Size(max = 100, message = "수정 메모는 100자를 초과할 수 없습니다.")
    private String editMemo;
}
