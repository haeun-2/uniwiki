package com.kiwi.uniwiki.domain.search.service.module;


import com.kiwi.uniwiki.domain.search.dto.RagDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class Reranker {

    private final ChatClient ai;

    /**
     * LLM이 Fusion 결과를 실제 질문 맥락에 맞게 재정렬
     * - Fusion 점수 순이 아닌, 의미적 관련도 중심
     * - 상위 N개의 문서만 남김
     */
    public List<RagDocument> rerank(String question, List<RagDocument> candidates, int topN) {
        if (candidates.isEmpty()) return List.of();

        // 1. LLM 입력용 문서 구성
        String documents = candidates.stream()
                .map(document -> "ID:" + document.getDocumentId() + "\nCONTENT:" + document.getText())
                .collect(Collectors.joining("\n\n"));

        // 2. 프롬프트 정의
        String prompt = """
        You are a search reranker.
        Given a question and a list of documents, re-rank them by relevance.
        If the question mentions a specific university,
        prefer documents that mention that university or are clearly about it,
        but do not completely exclude others if they may still answer the question.
        
        1. Consider the question's meaning, not just surface similarity.
        2. Score each document 0–5.
        3. Keep only those with score >= 4.
        4. Among them, select up to the TOP %d most relevant ones.
        5. Return ONLY the document IDs, separated by commas (e.g., 89, 86, 87).
           Do not include brackets, explanations, or any other text.
        
        QUESTION:
        %s
        
        DOCUMENTS:
        %s
        """.formatted(topN, question, documents);

        try {
            // 3. LLM 호출
            String out = ai.prompt().user(prompt).call().content().trim();
            System.out.println(out);

            // 4. 결과 파싱 (예: "101,104,103")
            List<Integer> keep = Arrays.stream(out.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty() && s.matches("\\d+"))
                    .map(Integer::parseInt)
                    .distinct()
                    .limit(topN)
                    .toList();

            // 5. LLM이 선택한 문서만 유지
            Map<Integer, RagDocument> map = candidates.stream()
                    .collect(Collectors.toMap(RagDocument::getDocumentId, d -> d));

            return keep.stream()
                    .map(map::get)
                    .filter(Objects::nonNull)
                    .toList();

        } catch (Exception e) {
            log.warn("[RAG] Re-ranking failed: {}", e.getMessage());
            return candidates.stream().limit(topN).toList();
        }
    }

}
