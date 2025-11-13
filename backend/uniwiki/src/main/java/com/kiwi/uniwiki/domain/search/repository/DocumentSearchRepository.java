package com.kiwi.uniwiki.domain.search.repository;

import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface DocumentSearchRepository extends ElasticsearchRepository<DocumentIndex, Integer> {

    @Query("""
    {
      "bool": {
        "must": [
          {
            "multi_match": {
              "query": "?0",
              "type": "cross_fields",
              "fields": ["title", "content", "universityName"],
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
          },
          {
            "match_phrase": {
              "title": {
                "query": "?0",
                "boost": 2
             }
            }
          }
        ]
      }
    }
    """)
    Page<DocumentIndex> searchByKeyword(String keyword, Pageable pageable);

}
