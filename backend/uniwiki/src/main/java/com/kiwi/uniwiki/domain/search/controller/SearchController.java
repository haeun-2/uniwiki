package com.kiwi.uniwiki.domain.search.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.search.dto.request.SearchRequest;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.service.IndexService;
import com.kiwi.uniwiki.domain.search.service.RagService;
import com.kiwi.uniwiki.domain.search.service.SearchService;
import com.kiwi.uniwiki.domain.search.service.UniversityIndexService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    private final UniversityIndexService universityIndexService;

    /**
     * 테스트용 대학 인덱스 생성 API
     */
    @GetMapping("/universities/index")
    @Operation(summary = "테스트용 대학 인덱싱", description = "테스트용입니다.")
    public String initializeUniversityIndex() {
        universityIndexService.indexBulkUniversity();
        return "University index initialized successfully.";
    }

    @GetMapping("/universities")
    @Operation(summary = "대학 검색", description = "쿼리에 대학 이름이 포함되어 있으면 해당되는 대학 목록을 반환합니다. 키워드 검색할 때랑 같은 입력값 주시면 됩니다.")
    public ResponseEntity<List<SearchResponse.University>> search(@RequestParam String query) {
        List<SearchResponse.University> response = universityIndexService.searchUniversity(query);
        return ResponseEntity.ok(response);
    }

}
