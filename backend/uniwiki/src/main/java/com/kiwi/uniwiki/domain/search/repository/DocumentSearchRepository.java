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
            "fields": ["title^2", "content^1", "universityName.ngram^1.5", "categoryName^1"],
            "type": "best_fields"
        }
    }
    """)
    Page<DocumentIndex> searchByKeyword(String keyword, Pageable pageable);

}
