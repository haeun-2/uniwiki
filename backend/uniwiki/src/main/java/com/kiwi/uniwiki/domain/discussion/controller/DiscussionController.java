package com.kiwi.uniwiki.domain.discussion.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.discussion.dto.request.DiscussionRequestDTO;
import com.kiwi.uniwiki.domain.discussion.dto.response.DiscussionResponseDTO;
import com.kiwi.uniwiki.domain.discussion.service.DiscussionService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/discussions")
@Tag(name = "DiscussionController", description = "토론 관련 기능을 제공합니다.")
public class DiscussionController {

    private final DiscussionService discussionService;

    @PostMapping
    @Operation(summary = "토론 생성", description = "특정 문서에 대한 토론을 생성합니다.")
    public ResponseEntity<Integer> createDiscussion (
            @RequestBody DiscussionRequestDTO.CreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Integer discussionId = discussionService.createDiscussion(request, customUserDetails.getUser());
        return ResponseEntity.ok(discussionId);
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

}
