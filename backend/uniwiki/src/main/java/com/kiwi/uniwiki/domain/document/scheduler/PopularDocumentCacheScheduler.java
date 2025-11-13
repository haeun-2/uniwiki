package com.kiwi.uniwiki.domain.document.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class PopularDocumentCacheScheduler {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_POPULAR_DOCUMENTS_KEY = "documents:popular";

    /**
     * 매 정시(00분)마다 모든 대학의 인기 문서 캐시 삭제
     */
    @Scheduled(cron = "0 0 * * * *")
    public void clearAllPopularDocumentCache() {
        String pattern = REDIS_POPULAR_DOCUMENTS_KEY + "::*";
        Set<String> keys = redisTemplate.keys(pattern);

        if (keys != null && !keys.isEmpty()) {
            Long deletedCount = redisTemplate.delete(keys);
            log.info("[SCHEDULER] 인기 문서 캐시 {} 개 삭제 완료", deletedCount);
        } else {
            log.info("[SCHEDULER] 삭제할 인기 문서 캐시 없음");
        }
    }
}