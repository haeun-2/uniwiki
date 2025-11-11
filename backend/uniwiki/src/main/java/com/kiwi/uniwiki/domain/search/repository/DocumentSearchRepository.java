package com.kiwi.uniwiki.domain.search.repository;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface DocumentSearchRepository extends ElasticsearchRepository<DocumentIndex, Integer> {

    @Query("""
    {
        "multi_match": {
            "query": "?0",
            "fields": ["title^2", "content", "universityName.ngram", "categoryName"],
            "type": "best_fields"
        }
    }
    """)
    Page<DocumentIndex> searchByKeyword(String keyword, Pageable pageable);

}
