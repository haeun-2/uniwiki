package com.kiwi.uniwiki.domain.university.service;

import com.kiwi.uniwiki.domain.university.dto.response.UniversityResponseDTO;
import com.kiwi.uniwiki.domain.university.repository.UniversityBookmarkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PopularUniversityService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final UniversityBookmarkRepository universityBookmarkRepository;

    private static final String CACHE_KEY = "university:popular";
    private static final Duration CACHE_TTL = Duration.ofHours(12);

    /**
     * 인기 top10 대학 목록 조회 (Redis -> DB)
     */
    public List<UniversityResponseDTO> getPopularUniversities() {
        try {
            List<UniversityResponseDTO> cached
                    = (List<UniversityResponseDTO>) redisTemplate.opsForValue().get(CACHE_KEY);

            if (cached != null && !cached.isEmpty()) {
                log.debug("[REDIS] 인기 top10 대학 redis 캐시 조회 발생");
                return cached;
            }
        } catch (Exception e) {
            log.error("[REDIS] 인기 top10 대학 redis 캐시 조회 실패, DB 조회로 변경", e);
        }

        List<UniversityResponseDTO> universities = fetchFromDB();
        cachePopularUniversities(universities);

        return universities;
    }

    /**
     * DB에서 인기 top10 대학 조회
     */
    private List<UniversityResponseDTO> fetchFromDB() {
        return universityBookmarkRepository.findTop10UniversitiesByBookmarkCount()
                .stream()
                .map(UniversityResponseDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * 인기 top10 대학 목록 캐싱
     */
    private void cachePopularUniversities(List<UniversityResponseDTO> universities) {
        try {
            redisTemplate.opsForValue().set(CACHE_KEY, universities, CACHE_TTL);
            log.debug("[REDIS] 인기 top10 대학 redis 캐싱 완료");
        } catch (Exception e) {
            log.error("[REDIS] 인기 top10 대학 redis 캐싱 실패", e);
        }
    }
}
