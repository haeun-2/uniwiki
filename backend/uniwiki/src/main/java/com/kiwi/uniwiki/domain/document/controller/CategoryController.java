package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.domain.document.dto.response.CategoryResponseDTO;
import com.kiwi.uniwiki.domain.document.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/categories")
@Tag(name = "CategoryController", description = "카테고리 관련 기능을 제공합니다.")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "카테고리 전체 목록 조회", description = "카테고리 전체 목록을 조회합니다.")
    public ResponseEntity<CategoryResponseDTO> getAllCategories() {

        CategoryResponseDTO response = categoryService.getAllCategories();
        return ResponseEntity.ok(response);
    }
}
