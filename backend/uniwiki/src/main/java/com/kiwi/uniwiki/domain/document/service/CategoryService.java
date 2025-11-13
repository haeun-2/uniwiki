package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.dto.response.CategoryResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentResponseDTO;
import com.kiwi.uniwiki.domain.document.entity.Category;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.repository.CategoryRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final DocumentRepository documentRepository;

    /**
     * 특정 카테고리 조회
     */
    public Category getCategoryById(Short categoryId) {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    /**
     * 카테고리 전체 목록 조회
     */
    public List<CategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAll().stream()
                .map(CategoryResponseDTO::from)
                .toList();
    }

    /**
     * 특정 카테고리 소속 전체/대학별 문서 조회
     */
    public List<DocumentResponseDTO> getAllDocumentsByCategoryAndUniversity(Short categoryId, Short universityId) {

        List<Document> documents;
        if (universityId == null) {
            documents = documentRepository.findAllByCategoryIdOrderByTitleAsc(categoryId);
        } else {
            documents = documentRepository.findAllByCategoryIdAndUniversityIdOrderByTitleAsc(categoryId, universityId);
        }

        return documents.stream().map(DocumentResponseDTO::from).toList();
    }
}
