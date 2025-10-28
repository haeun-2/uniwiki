package com.kiwi.uniwiki.domain.document.dto.response;

import com.kiwi.uniwiki.domain.document.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CategoryResponseDTO {

    private Integer categoryId;
    private String categoryName;

    public static CategoryResponseDTO from(Category category) {
        return CategoryResponseDTO.builder()
                .categoryId(category.getId())
                .categoryName(category.getName())
                .build();
    }
}