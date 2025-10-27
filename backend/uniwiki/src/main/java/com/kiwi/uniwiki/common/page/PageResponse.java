package com.kiwi.uniwiki.common.page;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@AllArgsConstructor
public class PageResponse<T> {

    private Integer page;
    private Integer size;
    private Integer totalPages;
    private Long totalElements;
    private Boolean hasPre;
    private Boolean hasNext;
    private List<T> content;

    // 페이징 변환 유틸 메서드
    public static <T> PageResponse<T> from(Page<T> data) {
        return new PageResponse<>(
                data.getNumber(),
                data.getSize(),
                data.getTotalPages(),
                data.getTotalElements(),
                data.hasPrevious(),
                data.hasNext(),
                data.getContent()
        );
    }

    public static <T, R> PageResponse<R> from(Page<T> data, Function<? super T, ? extends R> mapper) {
        return PageResponse.from(data.map(mapper));
    }

}
