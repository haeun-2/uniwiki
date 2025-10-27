package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.domain.document.dto.response.CategoryResponseDTO;
import com.kiwi.uniwiki.domain.document.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 카테고리 전체 목록 조회
     */
    public CategoryResponseDTO getAllCategories() {

        List<CategoryResponseDTO.CategoryDTO> categoryList = categoryRepository.findAll().stream()
                .map(CategoryResponseDTO.CategoryDTO::from)
                .toList();

        return CategoryResponseDTO.builder()
                .categories(categoryList)
                .build();
    }

    /**
     * 특정 카테고리 소속 문서 조회
     */


    /**
     * 대학별 특정 카테고리 소속 문서 조회
     */
}
