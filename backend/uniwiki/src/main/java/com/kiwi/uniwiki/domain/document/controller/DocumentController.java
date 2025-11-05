package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentCreateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentUpdateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentSimpleResponseDTO;
import com.kiwi.uniwiki.domain.document.service.DocumentService;
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
@RequestMapping("/api/v1/documents")
@Tag(name = "DocumentController", description = "문서 관련 기능을 제공합니다.")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    @Operation(summary = "새 문서 생성", description = "새로운 문서를 생성합니다.")
    public ResponseEntity<String> createDocument(
            @RequestBody DocumentCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String response = documentService.createDocument(request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{documentTitle}")
    @Operation(summary = "특정 문서 조회", description = "제목으로 특정 문서를 조회합니다.")
    public ResponseEntity<DocumentDetailResponseDTO> getDocumentByTitle(
            @PathVariable String documentTitle
    ) {
        DocumentDetailResponseDTO response = documentService.getDocumentByTitle(documentTitle);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{documentId}")
    @Operation(summary = "특정 문서 수정 (새 버전 생성)", description = "특정 문서의 새 버전을 생성하여 수정합니다.")
    public ResponseEntity<String> updateDocument(
            @PathVariable Integer documentId,
            @RequestBody DocumentUpdateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String response = documentService.updateDocument(documentId, request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    @Operation(summary = "대학별 최신 수정 문서 조회", description = "대학별 최신 수정 문서 10개를 조회합니다.")
    public ResponseEntity<List<DocumentResponseDTO>> getRecentByUniversity(
            @RequestParam Short universityId
    ) {
        List<DocumentResponseDTO> responses = documentService.getRecentByUniversity(universityId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    @Operation(summary = "대학별 문서 조회", description = "대학별 문서 목록을 조회합니다.")
    public ResponseEntity<PageResponse<DocumentResponseDTO>> getAllByUniversity(
            @RequestParam Short universityId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<DocumentResponseDTO> responses = documentService.getAllByUniversity(universityId, page, size);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/popular")
    @Operation(summary = "대학별 인기 문서 조회", description = "대학별 top10 인기 문서 목록을 조회합니다.")
    public ResponseEntity<List<DocumentSimpleResponseDTO>> getPopularByUniversity(
            @RequestParam Short universityId
    ) {
        List<DocumentSimpleResponseDTO> responses = documentService.getPopularByUniversity(universityId);
        return ResponseEntity.ok(responses);
    }
}
