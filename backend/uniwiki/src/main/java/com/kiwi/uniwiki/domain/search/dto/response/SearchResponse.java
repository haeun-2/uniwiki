package com.kiwi.uniwiki.domain.search.dto.response;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.document.UniversityIndex;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

public class SearchResponse {

    @Getter
    @Builder
    public static class Document {
        private String title;
        private String preview;
        private String universityName;

        public static Document from(DocumentIndex documentIndex) {
            String preview = documentIndex.getContent().substring(0, Math.min(200, documentIndex.getContent().length()));
            return Document.builder()
                    .title(documentIndex.getTitle())
                    .preview(preview)
                    .universityName(documentIndex.getUniversityName())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class Rag {
        private String question;
        private String answer;
        private List<Document> sources;
    }

    @Getter
    @Builder
    public static class University {
        private Short universityId;
        private String universityName;
        private String logoUrl;

        public static University from(UniversityIndex universityIndex) {
            return University.builder()
                    .universityId(universityIndex.getId())
                    .universityName(universityIndex.getName())
                    .logoUrl(universityIndex.getLogoUrl())
                    .build();
        }

        public static List<University> from(List<UniversityIndex> universityIndices) {
            return universityIndices.stream().map(University::from).toList();
        }
    }

}
