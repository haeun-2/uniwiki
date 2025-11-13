package com.kiwi.uniwiki.domain.search.service.module;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QueryTransformer {

    private final ChatClient ai;

    /**
     * LLM을 사용해 사용자의 질문을 더 효과적인 검색 질의로 변환
     * - 약어 확장 ("경북대" → "경북대학교")
     * - 불필요한 조사 제거
     * - 동의어/관련어 포함
     * - 복합 질문을 쉼표로 분리
     */
    public String transform(String question) {
        String prompt = """
        You are a smart search query optimizer.
        Rewrite or expand the user's question into a more effective search query.
        - Expand abbreviations (e.g., "경북대" → "경북대학교")
        - Remove unnecessary particles
        - Include related synonyms
        - Keep meaning faithful to the original question

        QUESTION: %s
        OUTPUT:
        """.formatted(question);

        try {
            String transformed = ai.prompt().user(prompt).call().content().trim();
            return transformed.isEmpty() ? question : transformed;
        } catch (Exception e) {
            log.warn("[RAG] Query transformation failed: {}", e.getMessage());
            return question;
        }
    }

}
