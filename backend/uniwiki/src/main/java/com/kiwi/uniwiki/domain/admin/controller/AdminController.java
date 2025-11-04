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

    @PatchMapping("/user-reports/{userReportId}/reject")
    @Operation(summary = "유저 신고 거부", description = "유저 신고를 거부합니다.")
    public ResponseEntity<Void> rejectUserReport(
                                                   @AuthenticationPrincipal CustomUserDetails userDetails,
                                                   @PathVariable Integer userReportId,
                                                   @RequestBody AdminRequestDTO.ReportRejectedRequest request
    ) {
        adminWriteService.rejectUserReport(userDetails.getUser(), userReportId, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/user-reports/{userReportId}/resolve")
    @Operation(summary = "유저 신고 수락", description = "유저 신고를 수락합니다")
    public ResponseEntity<Void> resolvedUserReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer userReportId,
            @RequestBody AdminRequestDTO.ReportSolvedRequest request
    ) {
        adminWriteService.resolvedReport(userDetails.getUser(), userReportId, request);
        return ResponseEntity.ok().build();
    }
}
