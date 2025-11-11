package com.kiwi.uniwiki.domain.search.service;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.repository.DocumentSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.elasticsearch.ElasticsearchVectorStore;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class RagService {

    private final DocumentSearchRepository documentSearchRepository;
    private final ElasticsearchVectorStore vectorStore;
    private final ChatClient ai;

    /**
     * 사용자의 질문(question)에 대해 RAG(Retrieval-Augmented Generation) 검색
     * 유사도 검색 → 프롬프트 생성 → 답변 생성 → 관련 문서 반환
     */
    public SearchResponse.Rag searchByRag(String question) {
        // 1. 벡터 기반 유사도 검색 수행
        List<Document> vectorStoreResult =
                vectorStore.doSimilaritySearch(SearchRequest.builder()
                        .query(question)
                        .topK(5)
                        .similarityThreshold(0.5)
                        .build()
                );

        // 2. 검색 결과에서 문서 내용(context) 추출
        String documents = vectorStoreResult.stream()
                .map(Document::getText)
                .collect(Collectors.joining(System.lineSeparator()));

        // 검색된 문서가 없을 경우 기본 응답 반환
        if (documents.isEmpty()) {
            return SearchResponse.Rag.builder()
                    .question(question)
                    .answer("관련된 문서를 찾을 수 없습니다.")
                    .sources(Collections.emptyList())
                    .build();
        }

        // 3. AI에 전달할 프롬프트 구성
        String prompt = """
                You are a helpful assistant.
                Use the information from the DOCUMENTS section to provide accurate answers to the
                question in the QUESTION section.
                If unsure, simply state that you don't know.
                
                DOCUMENTS:
                """ + documents
                + """
                QUESTION:
                """ + question;

        // 4. AI 모델을 통해 답변 생성
        String answer = ai
                .prompt()
                .user(prompt)
                .call()
                .content();

        // 5. 검색된 문서들의 documentId 추출
        List<Integer> documentIds = vectorStoreResult.stream()
                .map(d -> (Integer) d.getMetadata().get("documentId"))
                .distinct() // 동일 문서 중복 제거
                .toList();

        // 6. Elasticsearch에서 메타데이터 조회
        Iterable<DocumentIndex> metadataIterable = documentSearchRepository.findAllById(documentIds);
        List<DocumentIndex> metadataList = StreamSupport.stream(metadataIterable.spliterator(), false).toList();
        // documentId → DocumentIndex 매핑
        Map<Integer, DocumentIndex> documentIndexMap = metadataList.stream()
                .collect(Collectors.toMap(DocumentIndex::getId, doc -> doc));

        // 7. 최종 응답 생성
        return SearchResponse.Rag.builder()
                .question(question)
                .answer(answer)
                .sources(
                        documentIds.stream()
                                .map(documentIndexMap::get) // documentId 기반으로 DocumentIndex 조회
                                .distinct()
                                .filter(Objects::nonNull)
                                .map(SearchResponse.Document::from) // DTO 변환
                                .toList()
                )
                .build();

    }

}
