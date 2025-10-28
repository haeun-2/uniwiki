package com.kiwi.uniwiki.domain.document.dto.response;

import com.kiwi.uniwiki.domain.document.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DocumentDetailResponseDTO {

    private Short universityId;
    private String universityName;
    private Integer documentId;
    private String documentTitle;
    private String documentContent;
    private LocalDateTime updatedAt;

    public static DocumentDetailResponseDTO from(Document document, String documentContent) {
        return DocumentDetailResponseDTO.builder()
                .universityId(document.getUniversity().getId())
                .universityName(document.getUniversity().getName())
                .documentId(document.getId())
                .documentTitle(document.getTitle())
                .documentContent(documentContent)
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}

