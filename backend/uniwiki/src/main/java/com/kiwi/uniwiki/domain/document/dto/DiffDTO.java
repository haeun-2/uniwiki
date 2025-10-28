package com.kiwi.uniwiki.domain.document.dto;

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

        public int plusCount;
        public int minusCount;
        public String diffs;
    }

    /**
     * 라인별 비교 정보
     */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class DiffLineDTO {

        public int lineNumber;
        public String content;
        public String type; // INSERT, DELETE, CHANGE_OLD, CHANGE_NEW
    }
}
