package com.kiwi.uniwiki.domain.search.service.module;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.dto.RagDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FusionRetriever {

    private static final int K = 60; // RRF 상수

    /**
     * Dense(의미 검색)과 Sparse(키워드 검색) 결과를 (RRF) 기반 결합
     */
    public List<RagDocument> fuse(List<Document> dense, List<DocumentIndex> sparse, int topK) {
        Map<Integer, Double> scoreMap = new HashMap<>();
        Map<Integer, RagDocument> base = new HashMap<>();

        // Dense 문서의 RRF score 계산
        for (int rank = 1; rank <= dense.size(); rank++) {
            Document document = dense.get(rank - 1);
            Integer documentId = (Integer) document.getMetadata().get("documentId");
            if (documentId == null) continue;

            double score = 1.0 / (K + rank);
            scoreMap.merge(documentId, score, Double::sum);
            base.putIfAbsent(documentId, new RagDocument(documentId, document.getText(), score));
        }

        // Sparse 문서의 RRF score 계산
        for (int rank = 1; rank <= sparse.size(); rank++) {
            DocumentIndex documentIndex = sparse.get(rank - 1);
            double score = 1.0 / (K + rank);
            scoreMap.merge(documentIndex.getId(), score, Double::sum);
            base.putIfAbsent(documentIndex.getId(), new RagDocument(documentIndex.getId(), documentIndex.getContent(), score));
        }

        // score 기준으로 정렬하여 상위 15개 문서 반환
        return scoreMap
                .entrySet()
                .stream()
                .map(e -> {
                    RagDocument ragDocument = base.get(e.getKey());
                    return new RagDocument(ragDocument.getDocumentId(), ragDocument.getText(), e.getValue());
                })
                .sorted(Comparator.comparing(RagDocument::getScore).reversed())
                .limit(topK)
                .toList();
    }

}
