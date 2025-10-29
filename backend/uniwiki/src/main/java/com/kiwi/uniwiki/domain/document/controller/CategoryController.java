package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.document.dto.response.CategoryResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentResponseDTO;
import com.kiwi.uniwiki.domain.document.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/categories")
@Tag(name = "CategoryController", description = "카테고리 관련 기능을 제공합니다.")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "카테고리 전체 목록 조회", description = "카테고리 전체 목록을 조회합니다.")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {

        List<CategoryResponseDTO> responses = categoryService.getAllCategories();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{categoryId}")
    @Operation(summary = "카테고리 소속 문서 전체/대학별 목록 조회", description = "특정 카테고리에 소속된 전체/대학별 문서 목록을 조회합니다.")
    public ResponseEntity<PageResponse<DocumentResponseDTO>> getAllDocuments(
            @PathVariable Short categoryId,
            @RequestParam(required = false) Short universityId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<DocumentResponseDTO> responses;
        if (universityId != null) {
            responses = categoryService.getAllDocumentsByUniversityId(categoryId, universityId, page, size);
        } else {
            responses = categoryService.getAllDocuments(categoryId, page, size);
        }

        return ResponseEntity.ok(responses);
    }
}