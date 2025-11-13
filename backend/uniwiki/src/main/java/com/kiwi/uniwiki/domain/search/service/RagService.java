package com.kiwi.uniwiki.domain.search.service;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.dto.RagDocument;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.repository.DocumentSearchRepository;
import com.kiwi.uniwiki.domain.search.service.module.AnswerGenerator;
import com.kiwi.uniwiki.domain.search.service.module.FusionRetriever;
import com.kiwi.uniwiki.domain.search.service.module.QueryTransformer;
import com.kiwi.uniwiki.domain.search.service.module.Reranker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.elasticsearch.ElasticsearchVectorStore;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagService {

    private static final int FUSION_TOP_K = 15; // Fusion 단계에서 결합할 문서 수
    private static final int RERANK_TOP_N = 5;  // Re-ranking 단계에서 최종 선택할 문서 수

    private final QueryTransformer queryTransformer;
    private final FusionRetriever fusionRetriever;
    private final Reranker reranker;
    private final AnswerGenerator answerGenerator;
    private final ElasticsearchVectorStore vectorStore;
    private final DocumentSearchRepository documentSearchRepository;

    public SearchResponse.Rag searchByRag(String question) {
        log.info("[RAG] Query: {}", question);

        // 1. Query Transformation - 효과적인 검색 질의 생성
        String transformed = queryTransformer.transform(question);
        log.info("[RAG] Transformed Query: {}", transformed);

        // 2. Dense(의미) & Sparse(키워드) 검색 수행
        List<Document> dense = vectorStore.doSimilaritySearch(
                SearchRequest.builder()
                        .query(transformed)
                        .topK(10)
                        .similarityThreshold(0.4)
                        .build()
        );
        List<DocumentIndex> sparse = documentSearchRepository.searchByKeyword(transformed, PageRequest.of(0, 10)).getContent();

        // 3. Fusion Retrieval - 검색 결과를 결합하여 검색 빈도가 높은 상위 15개 문서 추출
        List<RagDocument> fused = fusionRetriever.fuse(dense, sparse, FUSION_TOP_K);
        log.info("[RAG] Fused Output: {}", fused.size());

        // 4. Re-ranking - 질문 맥락을 기준으로 의미적 관련성이 높은 상위 5개 문서 추출
        List<RagDocument> reranked = reranker.rerank(question, fused, RERANK_TOP_N);
        log.info("[RAG] Rerank Output: {}", reranked.size());

        // 검색된 문서가 없을 경우 기본 응답 반환
        if (reranked.isEmpty()) {
            return SearchResponse.Rag.builder()
                    .question(question)
                    .answer("관련된 문서를 찾을 수 없습니다.")
                    .sources(Collections.emptyList())
                    .build();
        }

        // 5. Answer Generation - 질문과 문서를 기반으로 답변 생성
        String answer = answerGenerator.generate(question, reranked);
        log.info("[RAG] Answer: {}", answer);

        // 6. 최종 문서에 메타데이터 조회하여 매핑
        List<Integer> documentIds = reranked.stream().map(RagDocument::getDocumentId).toList();

        Map<Integer, DocumentIndex> map = new HashMap<>();
        documentSearchRepository.findAllById(documentIds).forEach(document -> map.put(document.getId(), document));

        // 7. 응답 생성
        return SearchResponse.Rag.builder()
                .question(question)
                .answer(answer)
                .sources(
                        documentIds.stream()
                                .map(map::get)
                                .filter(Objects::nonNull)
                                .map(SearchResponse.Document::from)
                                .collect(Collectors.toList())
                )
                .build();
    }

}
