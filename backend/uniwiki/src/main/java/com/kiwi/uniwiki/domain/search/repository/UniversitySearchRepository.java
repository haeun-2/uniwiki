package com.kiwi.uniwiki.domain.search.repository;

import com.kiwi.uniwiki.domain.search.document.UniversityIndex;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface UniversitySearchRepository extends ElasticsearchRepository<UniversityIndex, Integer> {

    @Query("""
    {
        "match": {
            "name": {
                "query": "?0",
                "operator": "or"
            }
        }
    }
    """)
    List<UniversityIndex> searchByName(String name);

}
