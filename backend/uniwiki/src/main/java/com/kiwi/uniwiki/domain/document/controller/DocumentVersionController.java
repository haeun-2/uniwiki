package com.kiwi.uniwiki.domain.document.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/documents/{document_id}/versions")
@Tag(name = "DocumentVersionController", description = "문서 버전 관련 기능을 제공합니다.")
public class DocumentVersionController {


}
