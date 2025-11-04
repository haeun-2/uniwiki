package com.kiwi.uniwiki.domain.search.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
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

    /**
     * 테스트용 문서 인덱싱 컨트롤러
     */
    @GetMapping("/test/{documentId}")
    public String creteTest(@PathVariable Integer documentId) {
        searchService.createDocumentIndex(documentId);
        return "ok";
    }

    @GetMapping
    @Operation(summary = "키워드 검색 (미완성, 응답 형태만 참고바람니다)", description = "제목 또는 내용에 키워드가 포함된 문서를 검색합니다.")
    public ResponseEntity<PageResponse<SearchResponse.Document>> searchTest(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<SearchResponse.Document> response = searchService.searchByKeyword(keyword, page, size);
        return ResponseEntity.ok(response);
    }

}
