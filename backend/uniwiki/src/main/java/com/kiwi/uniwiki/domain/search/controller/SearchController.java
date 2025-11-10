package com.kiwi.uniwiki.domain.search.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.search.dto.request.SearchRequest;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.service.IndexService;
import com.kiwi.uniwiki.domain.search.service.RagService;
import com.kiwi.uniwiki.domain.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/search")
@Tag(name = "SearchController", description = "검색 관련 기능을 제공합니다.")
public class SearchController {

    private final SearchService searchService;
    private final RagService ragService;
    private final IndexService indexService;

    /**
     * 테스트용 문서 인덱싱 컨트롤러
     */
    @GetMapping("/index/{documentId}")
    @Operation(summary = "인덱싱 테스트용 컨트롤러", description = "테스트용 입니다.")
    public String indexDocument(@PathVariable Integer documentId) {
        indexService.indexDocument(documentId);
        return "ok";
    }

    @GetMapping("/keyword")
    @Operation(summary = "키워드 검색", description = "제목 또는 내용에 키워드가 포함된 문서를 검색합니다.")
    public ResponseEntity<PageResponse<SearchResponse.Document>> searchByKeyword(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<SearchResponse.Document> response = searchService.searchByKeyword(query, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rag")
    @Operation(summary = "자연어 검색", description = "RAG로 문서 검색합니다. 질문, 답변, 관련 문서 정보가 반환됩니다.")
    public ResponseEntity<SearchResponse.Rag> searchByRag(
            @ModelAttribute SearchRequest.Rag request
    ) {
        SearchResponse.Rag response = ragService.searchByRag(request.getQuestion());
        return ResponseEntity.ok(response);
    }

}
