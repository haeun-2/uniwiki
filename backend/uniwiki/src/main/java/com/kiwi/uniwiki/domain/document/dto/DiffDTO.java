package com.kiwi.uniwiki.domain.document.dto;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class DiffDTO {

    /**
     * 비교 결과 정보
     */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class DiffInfoDTO {

        public Integer plusCount;
        public Integer minusCount;
        public String diffs;

        public static DiffInfoDTO from(DocumentVersion documentVersion) {
            return DiffInfoDTO.builder()
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

        public Integer lineNumber;
        public String content;
        public String type; // INSERT, DELETE, CHANGE_OLD, CHANGE_NEW
    }
}
