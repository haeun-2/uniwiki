package com.kiwi.uniwiki.domain.search.service;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.repository.DocumentSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SearchService {

    private final DocumentSearchRepository documentSearchRepository;

    public PageResponse<SearchResponse.Document> searchByKeyword(String keyword, Integer page, Integer size) {
        Page<DocumentIndex> documentIndices = documentSearchRepository.searchByKeyword(keyword, PageRequest.of(page, size));
        return PageResponse.from(documentIndices, SearchResponse.Document::from);
    }

}