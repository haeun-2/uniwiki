package com.kiwi.uniwiki.domain.university.service;


import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.university.dto.response.UniversityDetailResponseDTO;
import com.kiwi.uniwiki.domain.university.dto.response.UniversityResponseDTO;
import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.repository.UniversityRepository;
import com.kiwi.uniwiki.security.util.EmailDomainExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UniversityService {

    private final UniversityRepository universityRepository;
    private final EmailDomainExtractor emailDomainExtractor;

    /**
     * 이메일 주소로 대학 인증
     */
    @Transactional(readOnly = true)
    public University getUniversity(String email) {
        // 1. 이메일 형식 검증
        if (!emailDomainExtractor.isValidEmail(email)) {
            throw new RuntimeException("올바르지 않은 이메일 형식 입니다.");
        }

        // 2. 대학 이메일인지 확인
        if (!emailDomainExtractor.isUniversityEmail(email)) {
            return null;
        }

        // 3. 도메인 추출
        String domain = emailDomainExtractor.extractDomain(email);
        log.info("추출된 도메인: {}", domain);

        // 4. 도메인으로 대학 조회
        Optional<University> universityOpt = universityRepository.findByEmailDomain(domain);

        if (universityOpt.isEmpty()) {
            return null;
        }

        return universityOpt.get();
    }

    /**
     * 대학 상세 정보 조회
     */
    public UniversityDetailResponseDTO getUniversityDetail(Integer universityId) {

        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNIVERSITY_NOT_FOUND));

        return UniversityDetailResponseDTO.from(university);
    }

    /**
     * 전체 대학 목록 조회
     */
    public List<UniversityResponseDTO> getAllUniversities() {

        return universityRepository.findAll().stream()
                .map(UniversityResponseDTO::from)
                .toList();
    }

    /**
     * 특정 지역 대학 목록 조회
     */
    public List<UniversityResponseDTO> getUniversitiesByRegionId(Integer regionId) {

        return universityRepository.findAllByRegionId(regionId).stream()
                .map(UniversityResponseDTO::from)
                .toList();
    }

    /**
     * 대학 인기순 조회 (TOP10)
     */
}
