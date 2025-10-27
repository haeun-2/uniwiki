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

    private List<CategoryDTO> categories;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CategoryDTO {
        private Integer categoryId;
        private String categoryName;

        public static CategoryDTO from(Category category) {
            return CategoryDTO.builder()
                    .categoryId(category.getId())
                    .categoryName(category.getName())
                    .build();
        }
    }
}