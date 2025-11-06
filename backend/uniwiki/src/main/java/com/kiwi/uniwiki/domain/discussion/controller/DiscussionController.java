package com.kiwi.uniwiki.domain.discussion.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionContentRequestDTO;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionRequestDTO;
import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionContentResponseDTO;
import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionResponseDTO;
import com.kiwi.uniwiki.domain.discussion.service.DiscussionContentService;
import com.kiwi.uniwiki.domain.discussion.service.DiscussionService;
import com.kiwi.uniwiki.domain.discussion.service.DiscussionSseService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/discussions")
@Tag(name = "DiscussionController", description = "토론 관련 기능을 제공합니다.")
public class DiscussionController {

    private final DiscussionService discussionService;
    private final DiscussionContentService discussionContentService;
    private final DiscussionSseService discussionSseService;

    @PostMapping
    @Operation(summary = "토론 생성", description = "특정 문서에 대한 토론을 생성합니다.")
    public ResponseEntity<DiscussionResponseDTO.CreateResponse> createDiscussion (
            @RequestBody DiscussionRequestDTO.CreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        DiscussionResponseDTO.CreateResponse response = discussionService.createDiscussion(request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "문서의 열린 토론 목록 조회", description = "특정 문서의 열린 토론 목록을 조회합니다.")
    public ResponseEntity<PageResponse<DiscussionResponseDTO.SimpleResponse>> getDiscussionsByDocument (
            @RequestParam("document") Integer documentId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<DiscussionResponseDTO.SimpleResponse> response = discussionService.getOpenDiscussionsByDocument(documentId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    @Operation(summary = "대학의 최근 토론 목록 조회", description = "특정 대학의 최근 수정된 토론 목록을 조회합니다.")
    public ResponseEntity<List<DiscussionResponseDTO.SimpleResponse>> getRecentDiscussionByUniversity (
            @RequestParam("university") Integer universityId
    ) {
        List<DiscussionResponseDTO.SimpleResponse> response = discussionService.getRecentDiscussionsByUniversity(universityId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{discussionId}/close")
    @Operation(summary = "토론 종료", description = "토론을 종료합니다. 토론 생성자만 종료할 수 있습니다.")
    public ResponseEntity<Void> closeDiscussion(
            @PathVariable Integer discussionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        discussionContentService.closeDiscussion(discussionId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{discussionId}/pause")
    @Operation(summary = "토론 중지", description = "토론을 중지합니다. 토론 생성자만 중지할 수 있습니다.")
    public ResponseEntity<Void> pauseDiscussion(
            @PathVariable Integer discussionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        discussionContentService.pauseDiscussion(discussionId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }


    @PostMapping("/{discussionId}/contents")
    @Operation(summary = "토론 의견 작성", description = "토론에 의견을 작성합니다.")
    public ResponseEntity<Void> createDiscussionContent(
            @RequestBody DiscussionContentRequestDTO.CreateContentRequest request,
            @PathVariable Integer discussionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        discussionContentService.createDiscussionContent(request, discussionId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{discussionId}")
    @Operation(summary = "토론 상세 조회", description = "토론 상세 조회합니다.")
    public ResponseEntity<DiscussionResponseDTO.DetailResponse> getDiscussion(
            @PathVariable Integer discussionId
    ) {
        DiscussionResponseDTO.DetailResponse response = discussionService.getDiscussionDetail(discussionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/{discussionId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "토론 SSE 연결", description = "토론 SSE에 연결합니다. 연결 후 새 토론 내용을 전달받을 수 있습니다.")
    public ResponseEntity<SseEmitter> connect(
            @PathVariable Integer discussionId
    ) {
        SseEmitter emitter = discussionSseService.connect(discussionId);
        return ResponseEntity.ok(emitter);
    }

}
