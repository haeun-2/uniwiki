package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.domain.document.dto.request.DocumentCreateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentUpdateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.service.DocumentService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam String documentTitle
    ) {
        DocumentDetailResponseDTO response = documentService.getDocumentByTitle(documentTitle);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{documentId}")
    @Operation(summary = "특정 문서 수정 (새 버전 생성)", description = "특정 문서의 새 버전을 생성하여 수정합니다.")
    public ResponseEntity<String> updateDocument(
            @RequestParam Integer documentId,
            @RequestBody DocumentUpdateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String response = documentService.updateDocument(documentId, request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }
}
