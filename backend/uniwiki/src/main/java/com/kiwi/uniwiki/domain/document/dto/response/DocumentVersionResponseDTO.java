package com.kiwi.uniwiki.domain.document.dto.response;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class DocumentVersionResponseDTO {

    private LocalDateTime createdAt;
    private Integer versionNumber;
    private Integer plusCount;
    private Integer minusCount;
    private String editorNickname;
    private String editMemo;

    public static DocumentVersionResponseDTO from(DocumentVersion documentVersion) {

        return DocumentVersionResponseDTO.builder()
                .createdAt(documentVersion.getCreatedAt())
                .versionNumber(documentVersion.getVersionNumber())
                .plusCount(documentVersion.getPlusCount())
                .minusCount(documentVersion.getMinusCount())
                .editorNickname(documentVersion.getEditor().getNickname())
                .editMemo(documentVersion.getEditMemo())
                .build();
    }

    public static List<DocumentVersionResponseDTO> from(List<DocumentVersion> documentVersions) {
        return documentVersions.stream().map(DocumentVersionResponseDTO::from).toList();
    }
}
