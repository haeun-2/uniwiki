package com.kiwi.uniwiki.domain.search.scheduler;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.search.service.IndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@EnableScheduling
@Slf4j
public class DocumentReindexScheduler {

    private static final int BATCH_SIZE = 100;

    private final DocumentVersionRepository documentVersionRepository;
    private final IndexService indexService;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void reindexUpdatedDocuments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastIndexedAt = now.minusHours(24);

        log.info("[Batch Index] Reindexing documents updated after {}", lastIndexedAt);

        // 마지막 인덱싱 이후 수정된 DocumentVersion 최신 버전만 가져오기
        List<DocumentVersion> updatedVersions = documentVersionRepository.findLatestVersionsUpdatedAfter(lastIndexedAt);

        if (updatedVersions.isEmpty()) {
            log.info("[Batch Index] No documents to reindex.");
            return;
        }

        // 배치 단위로 분할
        for (int i = 0; i < updatedVersions.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, updatedVersions.size());
            List<DocumentVersion> batch = updatedVersions.subList(i, end);

            // 배치 인덱싱
            indexService.indexDocumentsBulk(batch);
            log.info("[Batch Index] Processed batch {} - {} documents", (i / BATCH_SIZE) + 1, batch.size());
        }


        log.info("[Batch Index] Reindexed {} documents.", updatedVersions.size());
    }

}
