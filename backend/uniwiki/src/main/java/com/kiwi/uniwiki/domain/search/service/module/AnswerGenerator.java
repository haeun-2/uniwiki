package com.kiwi.uniwiki.domain.search.service.module;

import com.kiwi.uniwiki.domain.search.dto.RagDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnswerGenerator {

    private final ChatClient ai;

    /**
     * 상위 문서를 바탕으로 LLM이 실제 답변 생성
     */
    public String generate(String question, List<RagDocument> documents) {
        String context = documents.stream()
                .map(d -> "[" + d.getDocumentId() + "] " + d.getText())
                .collect(Collectors.joining("\n\n"));

        String prompt = """
        You are a helpful assistant.
        Use the CONTEXT to answer the QUESTION as accurately as possible.
        If the answer can be reasonably inferred or partially known from the CONTEXT, provide your best factual answer.
        If the context clearly contains no relevant information, respond exactly:
        "제공된 내용에서는 해당 질문에 대한 정보를 확인할 수 없습니다."
        
        QUESTION:
        %s
        
        CONTEXT:
        %s
        """.formatted(question, context);

        try {
            return ai.prompt().user(prompt).call().content().trim();
        } catch (Exception e) {
            log.warn("[RAG] Answer generation failed: {}", e.getMessage());
            return "관련된 문서를 찾았지만, 요약 답변을 생성하지 못했습니다.";
        }
    }

}
