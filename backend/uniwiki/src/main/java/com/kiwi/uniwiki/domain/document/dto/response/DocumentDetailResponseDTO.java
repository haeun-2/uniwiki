package com.kiwi.uniwiki.domain.document.dto.response;

import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
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
    private Short categoryId;
    private String categoryName;
    private Integer documentId;
    private Integer versionNumber;
    private String documentTitle;
    private String documentContent;
    private LocalDateTime updatedAt;

    public static DocumentDetailResponseDTO from(Document document, String documentContent) {
        return DocumentDetailResponseDTO.builder()
                .universityId(document.getUniversity().getId())
                .universityName(document.getUniversity().getName())
                .categoryId(document.getCategory().getId())
                .categoryName(document.getCategory().getName())
                .documentId(document.getId())
                .versionNumber(document.getLatestVersionNumber())
                .documentTitle(document.getTitle())
                .documentContent(documentContent)
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    public static DocumentDetailResponseDTO from(Document document, DocumentVersion documentVersion) {
        return DocumentDetailResponseDTO.builder()
                .universityId(document.getUniversity().getId())
                .universityName(document.getUniversity().getName())
                .categoryId(documentVersion.getCategory().getId())
                .categoryName(documentVersion.getCategory().getName())
                .documentId(document.getId())
                .versionNumber(documentVersion.getVersionNumber())
                .documentTitle(document.getTitle())
                .documentContent(documentVersion.getContent())
                .updatedAt(documentVersion.getCreatedAt())
                .build();
    }
}

