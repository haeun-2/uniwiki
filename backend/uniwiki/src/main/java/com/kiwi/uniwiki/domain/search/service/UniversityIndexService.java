package com.kiwi.uniwiki.domain.search.service;

import com.kiwi.uniwiki.domain.search.document.UniversityIndex;
import com.kiwi.uniwiki.domain.search.dto.response.SearchResponse;
import com.kiwi.uniwiki.domain.search.repository.UniversitySearchRepository;
import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversityIndexService {

    private final UniversityRepository universityRepository;
    private final UniversitySearchRepository universitySearchRepository;

    public void indexBulkUniversity() {

        List<University> universities = universityRepository.findAll();

        List<UniversityIndex> universityIndices = universities
                .stream()
                .map(university -> new UniversityIndex(
                        university.getId(),
                        university.getName(),
                        university.getLogoUrl()
                ))
                .toList();

        universitySearchRepository.saveAll(universityIndices);

        log.info("Bulk indexing completed: {} universities indexed", universityIndices.size());
    }

    public List<SearchResponse.University> searchUniversity(String name) {
        List<UniversityIndex> universityIndices = universitySearchRepository.searchByName(name);
        return SearchResponse.University.from(universityIndices);
    }
}
