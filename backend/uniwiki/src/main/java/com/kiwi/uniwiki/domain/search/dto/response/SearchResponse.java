package com.kiwi.uniwiki.domain.search.dto.response;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import lombok.Builder;
import lombok.Getter;

public class SearchResponse {

    @Getter
    @Builder
    public static class Document {
        private String title;
        private String preview;
        private Short universityId;
        private String universityName;
        private Short categoryId;
        private String CategoryName;

        public static Document from(DocumentIndex documentIndex) {
            return Document.builder()
                    .title(documentIndex.getTitle())
                    .preview(documentIndex.getContent().substring(0, 200))
                    .universityId(documentIndex.getUniversityId())
                    .universityName(documentIndex.getUniversityName())
                    .categoryId(documentIndex.getCategoryId())
                    .CategoryName(documentIndex.getCategoryName())
                    .build();
        }
    }

}
