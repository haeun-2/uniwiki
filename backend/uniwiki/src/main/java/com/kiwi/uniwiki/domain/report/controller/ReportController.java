package com.kiwi.uniwiki.domain.report.controller;

import com.kiwi.uniwiki.domain.report.dto.request.ReportRequestDTO;
import com.kiwi.uniwiki.domain.report.service.ReportService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports")
@Tag(name = "ReportController", description = "신고")
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/users")
    @Operation(summary = "유저 신고", description = "유저를 신고합니다.")
    public ResponseEntity<Void> reportUser(
            @RequestBody ReportRequestDTO.CreateReport request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        reportService.reportUser(request, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/discussion-contents")
    @Operation(summary = "토론 신고", description = "토론 내용을 신고합니다.")
    public ResponseEntity<Void> reportDiscussionContent(
            @RequestBody ReportRequestDTO.CreateReport request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        reportService.reportDiscussionContent(request, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

}
