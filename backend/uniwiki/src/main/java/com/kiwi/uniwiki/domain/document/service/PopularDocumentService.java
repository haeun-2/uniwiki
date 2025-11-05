package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.domain.document.dto.response.DocumentSimpleResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PopularDocumentService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final Integer LIMIT = 9;     // TOP 10
    private static final int WINDOW_HOURS = 24;
    private static final String REDIS_VIEW_KEY = "documents:view";

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHH");

    /**
     * 문서 조회수 증가
     */
    public void incrementDocumentView(Short universityId, String documentTitle) {
        String key = getCurrentHourKey(universityId);

        redisTemplate.opsForZSet().incrementScore(key, documentTitle, 1);
        redisTemplate.expire(key, Duration.ofHours(WINDOW_HOURS + 1));
    }

    /**
     * 시간별 문서 조회수 취합하여 인기 순위 계산
     */
    @Cacheable(value = "documents:popular", key = "#universityId")
    public List<DocumentSimpleResponseDTO> getPopularDocuments(Short universityId) {
        List<String> keys = getRecentHourKeys(universityId);
        String resultKey = "popular:temp:" + universityId + ":" + System.currentTimeMillis();

        try {
            redisTemplate.opsForZSet().unionAndStore(null, keys, resultKey);
            redisTemplate.expire(resultKey, Duration.ofSeconds(10));

            Set<ZSetOperations.TypedTuple<String>> result
                    = redisTemplate.opsForZSet().reverseRangeWithScores(resultKey, 0, LIMIT);

            if(result == null) {
                return List.of();
            }

            return result.stream()
                    .map(tuple -> new DocumentSimpleResponseDTO(tuple.getValue(), tuple.getScore().intValue()))
                    .collect(Collectors.toList());

        } finally {
            redisTemplate.delete(resultKey);
        }
    }

    /**
     * 대학 현재 시간 키
     */
    private String getCurrentHourKey(Short universityId) {
        LocalDateTime now = LocalDateTime.now();
        return String.format("%s::%d:%s", REDIS_VIEW_KEY, universityId, now.format(FORMATTER));
    }

    /**
     * 대학 시간별 키
     */
    private List<String> getRecentHourKeys(Short universityId) {
        List<String> keys = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < PopularDocumentService.WINDOW_HOURS; i++) {
            LocalDateTime time = now.minusHours(i);
            keys.add(String.format("%s::%d:%s", REDIS_VIEW_KEY, universityId, time.format(FORMATTER)));
        }

        return keys;
    }
}
