package com.kiwi.uniwiki.domain.document.event;

import com.kiwi.uniwiki.domain.search.service.IndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentEventHandler {

    private final IndexService indexService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void createdEventHandle(DocumentCreatedEvent event) {
        log.debug("[Event] 문서 {} 생성 이벤트 발행 - 인덱싱", event.getDocumentId());
        indexService.indexDocument(event.getDocumentId());
    }

}
