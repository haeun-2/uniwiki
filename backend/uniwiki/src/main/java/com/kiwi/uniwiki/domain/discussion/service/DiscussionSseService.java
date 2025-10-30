package com.kiwi.uniwiki.domain.discussion.service;

import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionContentResponseDTO;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
@RequiredArgsConstructor
public class DiscussionSseService {

    @Qualifier("sseExecutor")
    private final ThreadPoolTaskExecutor executor;

    // discussionId 별 연결된 SSE 구독자들 관리
    private final Map<Integer, List<SseEmitter>> emitterMap = new ConcurrentHashMap<>();
    private static final long DEFAULT_TIMEOUT = 1000L * 60 * 10; // 10분

    public SseEmitter connect(Integer discussionId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitterMap.computeIfAbsent(discussionId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // 클라이언트 정상 종료 감지
        emitter.onCompletion(() -> removeEmitter(discussionId, emitter));

        // 클라이언트 연결 끊김/오류 감지
        emitter.onError(e -> {
            log.error("[SSE] 처리 중 오류 발생 {}", e.getMessage());
            emitter.complete();
        });

        // 타임아웃 발생 시
        emitter.onTimeout(emitter::complete);

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected")
            );
        } catch (IOException e) {
            emitter.complete();
        }

        return emitter;
    }

    private void removeEmitter(Integer discussionId, SseEmitter emitter) {
        List<SseEmitter> emitters = emitterMap.get(discussionId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }

    private void sendToClient(Integer discussionId, String name, Object data) {
        List<SseEmitter> emitters = emitterMap.get(discussionId);
        if (emitters == null || emitters.isEmpty()) return;

        for (SseEmitter emitter : emitters) {
            executor.execute(() -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(name)
                            .data(data)
                    );
                } catch (IOException e) {
                    emitter.complete();
                }
            });
        }
    }

    public void sendDiscussionContent(Integer discussionId, DiscussionContent discussionContent) {
        sendToClient(discussionId, "new-content", DiscussionContentResponseDTO.Content.from(discussionContent));
    }

    public void sendDiscussionStatus(Integer discussionId, String status) {
        sendToClient(discussionId, "status-change", new DiscussionContentResponseDTO.StatusChange(status));
    }

}

