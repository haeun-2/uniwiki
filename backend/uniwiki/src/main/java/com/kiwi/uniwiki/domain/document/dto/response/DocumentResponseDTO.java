package com.kiwi.uniwiki.domain.document.dto.response;

import com.kiwi.uniwiki.domain.document.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class DocumentResponseDTO {

    private String documentTitle;
    private LocalDateTime updatedAt;

    public static DocumentResponseDTO from(Document document) {

        return DocumentResponseDTO.builder()
                .documentTitle(document.getTitle())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    public static List<DocumentResponseDTO> from(List<Document> documents) {

        return documents.stream().map(DocumentResponseDTO::from).toList();
    }
}
