package com.kiwi.uniwiki.domain.university.controller;

import com.kiwi.uniwiki.domain.university.dto.response.UniversityDetailResponseDTO;
import com.kiwi.uniwiki.domain.university.dto.response.UniversityResponseDTO;
import com.kiwi.uniwiki.domain.university.service.PopularUniversityService;
import com.kiwi.uniwiki.domain.university.service.UniversityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/universities")
@Tag(name = "UniversityController", description = "대학 관련 기능을 제공합니다.")
public class UniversityController {

    private final UniversityService universityService;
    private final PopularUniversityService popularUniversityService;

    @GetMapping
    @Operation(summary = "전체/지역별 대학 목록 조회", description = "전체/지역별 대학 목록을 조회합니다.")
    public ResponseEntity<List<UniversityResponseDTO>> getUniversities(@RequestParam(name = "region", required = false) Short regionId) {
        List<UniversityResponseDTO> responses;
        if (regionId != null) {
            responses = universityService.getUniversitiesByRegionId(regionId);
        } else {
            responses = universityService.getAllUniversities();
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{universityId}")
    @Operation(summary = "특정 대학 상세정보 조회", description = "특정 대학의 상세정보를 조회합니다.")
    public ResponseEntity<UniversityDetailResponseDTO> getUniversityDetail(@PathVariable Short universityId) {

        UniversityDetailResponseDTO response = universityService.getUniversityDetail(universityId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    @Operation(summary = "인기 대학 목록 조회", description = "인기 TOP10 대학 목록을 조회합니다.")
    public ResponseEntity<List<UniversityResponseDTO>> getUniversities() {
        List<UniversityResponseDTO> responses = popularUniversityService.getPopularUniversities();
        return ResponseEntity.ok(responses);
    }
}
