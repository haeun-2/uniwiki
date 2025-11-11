package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.document.dto.DiffDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentVersionResponseDTO;
import com.kiwi.uniwiki.domain.document.service.DocumentVersionService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/documents/{documentId}/versions")
@Tag(name = "DocumentVersionController", description = "문서 버전 관련 기능을 제공합니다.")
public class DocumentVersionController {

    private final DocumentVersionService documentVersionService;

    @GetMapping
    @Operation(summary = "문서의 전체 버전 목록 조회", description = "특정 문서의 전체 버전 목록을 조회합니다.")
    public ResponseEntity<PageResponse<DocumentVersionResponseDTO>> getAllVersions (
            @PathVariable Integer documentId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<DocumentVersionResponseDTO> response = documentVersionService.getAllVersions(documentId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{versionId}")
    @Operation(summary = "특정 버전 문서 내용 조회", description = "특정 버전의 문서 내용을 조회합니다.")
    public ResponseEntity<DocumentDetailResponseDTO> getVersionOfDocument(
            @PathVariable Integer documentId,
            @PathVariable Integer versionId
    ) {
        DocumentDetailResponseDTO response = documentVersionService.getVersionOfDocument(documentId, versionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{versionId}/diff")
    @Operation(summary = "특정 버전 문서 변경 내역 조회", description = "특정 버전 문서의 변경 내역을 조회합니다.")
    public ResponseEntity<DiffDTO.DiffInfoDTO> getDiffOfVersion(
            @PathVariable Integer documentId,
            @PathVariable Integer versionId
    ) {
        DiffDTO.DiffInfoDTO response = documentVersionService.getDiffOfVersion(documentId, versionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{versionId}/rollback")
    @Operation(summary = "특정 버전으로 되돌리기 (새 버전 생성)", description = "특정 버전의 내용으로 문서의 새 버전을 생성합니다.")
    public ResponseEntity<String> rollbackToVersion(
            @PathVariable Integer documentId,
            @PathVariable Integer versionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ) {
        String response = documentVersionService.rollbackToVersion(documentId, versionId, userDetails.getUser());
        return ResponseEntity.ok(response);
    }
}
