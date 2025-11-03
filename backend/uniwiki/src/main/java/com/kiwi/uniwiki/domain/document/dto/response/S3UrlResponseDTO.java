package com.kiwi.uniwiki.domain.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class S3UrlResponseDTO {

    private String presignedUrl;
}
