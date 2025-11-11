package com.kiwi.uniwiki.domain.search.repository;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface DocumentSearchRepository extends ElasticsearchRepository<DocumentIndex, Integer> {

    @Query("""
    {
      "bool": {
        "must": [
          {
            "multi_match": {
              "query": "?0",
              "fields": ["title", "content", "universityName"],
              "type": "most_fields",
              "operator": "and",
              "minimum_should_match": "100%"
            }
          }
        ],
        "should": [
          {
            "match": {
              "universityName": {
                "query": "?0"
              }
            }
          }
        ]
      }
    }
    """)
    Page<DocumentIndex> searchByKeyword(String keyword, Pageable pageable);


}
