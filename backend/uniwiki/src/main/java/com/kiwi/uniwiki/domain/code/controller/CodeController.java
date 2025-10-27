package com.kiwi.uniwiki.domain.code.controller;

import com.kiwi.uniwiki.domain.code.dto.response.CodeResponseDTO;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/codes")
@Tag(name = "CodeController", description = "코드 관련 기능을 제공합니다.")
public class CodeController {

    private final CodeService codeService;

    @Operation(summary = "코드 전체 목록 조회", description = "코드 전체 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<CodeResponseDTO> getAllCodes() {
        CodeResponseDTO response = codeService.getAllCodes();
        return ResponseEntity.ok(response);
    }

}
