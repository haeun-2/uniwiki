package com.kiwi.uniwiki.domain.admin.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.admin.dto.request.AdminRequestDTO;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import com.kiwi.uniwiki.domain.admin.service.AdminReadService;
import com.kiwi.uniwiki.domain.admin.service.AdminWriteService;
import com.kiwi.uniwiki.domain.report.dto.request.ReportRequestDTO;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Tag(name = "AdminController", description = "관리자 기능")
public class AdminController {

    private final AdminReadService adminReadService;
    private final AdminWriteService adminWriteService;

    @GetMapping("/user-reports")
    @Operation(summary = "유저 신고 목록 조회", description = "유저를 신고 목록을 조회합니다")
    public ResponseEntity<PageResponse<AdminResponseDTO.UserReportResponse>> reportedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AdminResponseDTO.UserReportResponse> response = adminReadService.getUserReports(page,size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/user-reports/{reportedUserId}/reject")
    @Operation(summary = "유저 신고 거부", description = "유저 신고를 거부합니다.")
    public ResponseEntity<Void> rejectUserReport(
                                                   @AuthenticationPrincipal CustomUserDetails userDetails,
                                                   @PathVariable Integer reportedUserId,
                                                   @RequestBody AdminRequestDTO.ReportRejectedRequest request
    ) {
        adminWriteService.rejectUserReport(userDetails.getUser(), reportedUserId, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/user-reports/{reportedUserId}/resolve")
    @Operation(summary = "유저 신고 수락", description = "유저 신고를 수락합니다")
    public ResponseEntity<Void> resolvedUserReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer reportedUserId,
            @RequestBody AdminRequestDTO.ReportSolvedRequest request
    ) {
        adminWriteService.resolvedReport(userDetails.getUser(), reportedUserId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/discussion-reports")
    @Operation(summary = "토론 신고 목록 조회", description = "토론 신고 목록을 조회합니다")
    public ResponseEntity<PageResponse<AdminResponseDTO.DiscussionReportResponse>> reportedDiscussion(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AdminResponseDTO.DiscussionReportResponse> response = adminReadService.getDiscussionReports(page,size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/discussion-reports/{reportedDiscussionId}/reject")
    @Operation(summary = "토론 신고 거부", description = "토론 신고를 거부합니다.")
    public ResponseEntity<Void> rejectedDiscussionReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer reportedDiscussionId,
            @RequestBody AdminRequestDTO.ReportRejectedRequest request
    ) {
        adminWriteService.rejectDiscussionReport(userDetails.getUser(), reportedDiscussionId, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/discussion-reports/{reportedDiscussionId}/resolve")
    @Operation(summary = "토론 신고 수락", description = "토론 신고를 수락합니다")
    public ResponseEntity<Void> resolvedDiscussionReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer reportedDiscussionId,
            @RequestBody AdminRequestDTO.DiscussionReportSolvedRequest request
    ) {
        adminWriteService.resolvedDiscussionReport(userDetails.getUser(), reportedDiscussionId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/document-revisions")
    @Operation(summary = "문서 변경 이력 조회", description = "관리자가 쿤서 버전의 전체 이력을 조회합니다")
    public ResponseEntity<PageResponse<AdminResponseDTO.DocumentVersionList>> getDocumentAllVersions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AdminResponseDTO.DocumentVersionList> response=  adminReadService.getDocumentAllVersions(page,size);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/documents/{documentId}")
    @Operation(summary = "문서 삭제", description = "관리자가 문서를 삭제합니다.")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Integer documentId,
            @RequestBody AdminRequestDTO.DocumentDeleteRequest request
    ) {
        adminWriteService.deleteDocument(request, documentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/discussions")
    @Operation(summary = "오래된 토론 목록 조회", description = "안닫힌 토론 목록을 최근 댓글이 오래된 순으로 보여줍니다.")
    public ResponseEntity<PageResponse<AdminResponseDTO.DiscussionList>> getDiscussions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AdminResponseDTO.DiscussionList> response=  adminReadService.getAllDiscussion(page,size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/discussions/{discussionId}/close")
    @Operation(summary = "오래된 토론 종료", description = "오래된 토론을 종료합니다.")
    public ResponseEntity<Void> closedDiscussion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer discussionId
    ) {
        adminWriteService.closedDiscussion(discussionId,userDetails.getUser());
        return ResponseEntity.ok().build();
    }
}
