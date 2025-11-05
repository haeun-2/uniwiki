package com.kiwi.uniwiki.domain.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSimpleResponseDTO {

    private String documentTitle;
    private Integer viewCount;
}
