package com.kiwi.uniwiki.domain.university.controller;

import com.kiwi.uniwiki.domain.university.dto.response.RegionResponseDTO;
import com.kiwi.uniwiki.domain.university.service.RegionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/regions")
@Tag(name = "RegionController", description = "지역 관련 기능을 제공합니다.")
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    @Operation(summary = "지역 전체 목록 조회", description = "지역 전체 목록을 조회합니다.")
    public ResponseEntity<List<RegionResponseDTO>> getAllRegions() {

        List<RegionResponseDTO> responses = regionService.getAllRegions();
        return ResponseEntity.ok(responses);
    }
}
