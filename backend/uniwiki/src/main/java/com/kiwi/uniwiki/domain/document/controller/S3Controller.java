package com.kiwi.uniwiki.domain.document.controller;

import com.kiwi.uniwiki.domain.document.dto.response.S3UrlResponseDTO;
import com.kiwi.uniwiki.domain.document.service.S3Service;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/s3")
@Tag(name = "S3Controller", description = "S3 관련 기능을 제공합니다.")
public class S3Controller {

    private final S3Service s3Service;

    @GetMapping("/presigned-urls")
    @Operation(summary = "이미지 업로드용 url 발급", description = "이미지 업로드용 s3 presigned url을 발급합니다.")
    public ResponseEntity<S3UrlResponseDTO> getPresignedUrl() {

        S3UrlResponseDTO response = s3Service.getPresignedUrl();
        return ResponseEntity.ok(response);
    }
}
