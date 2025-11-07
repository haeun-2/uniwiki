package com.kiwi.uniwiki.domain.document.dto;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class DiffDTO {

    /**
     * 비교 결과 정보
     */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class DiffInfoDTO {

        private LocalDateTime oldCreatedAt;
        private LocalDateTime newCreatedAt;
        private Integer editorId;
        private String editorNickname;
        private String editMemo;
        private Integer plusCount;
        private Integer minusCount;
        private String diffs;

        public static DiffInfoDTO from(LocalDateTime oldCreatedAt, DocumentVersion documentVersion) {
            return DiffInfoDTO.builder()
                    .oldCreatedAt(oldCreatedAt)
                    .newCreatedAt(documentVersion.getCreatedAt())
                    .editorId(documentVersion.getEditor().getId())
                    .editorNickname(documentVersion.getEditor().getNickname())
                    .editMemo(documentVersion.getEditMemo())
                    .plusCount(documentVersion.getPlusCount())
                    .minusCount(documentVersion.getMinusCount())
                    .diffs(documentVersion.getContentDiff())
                    .build();
        }
    }

    /**
     * 라인별 비교 정보
     */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class DiffLineDTO {

        private Integer lineNumber;
        private String content;
        private String type; // INSERT, DELETE, CHANGE_OLD, CHANGE_NEW
    }
}
