package com.kiwi.uniwiki.domain.university.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.university.dto.response.RegionResponseDTO;
import com.kiwi.uniwiki.domain.university.entity.Region;
import com.kiwi.uniwiki.domain.university.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegionService {

    private final RegionRepository regionRepository;

    /**
     * 지역 목록 전체 조회
     */
    public List<RegionResponseDTO> getAllRegions() {

        return regionRepository.findAll().stream()
                .map(RegionResponseDTO::from)
                .toList();
    }

    /**
     * 특정 지역 조회
     */
    public Region getRegionById(Short id) {

        return regionRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.REGION_NOT_FOUND));
    }
}
