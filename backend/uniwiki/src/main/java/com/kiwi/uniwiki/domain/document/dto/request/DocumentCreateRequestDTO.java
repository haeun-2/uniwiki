package com.kiwi.uniwiki.domain.document.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DocumentCreateRequestDTO {

    @NotNull(message = "대학 선택은 필수입니다.")
    private Short universityId;

    @NotNull(message = "카테고리 선택은 필수입니다.")
    private Integer categoryId;

    @NotBlank(message = "문서 제목 입력은 필수입니다.")
    @Size(min = 1, max = 255, message = "문서 제목 최대 길이는 255자 입니다.")
    private String documentTitle;

    private String documentContent;
}
