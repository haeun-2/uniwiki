package com.kiwi.uniwiki.domain.university.dto.response;

import com.kiwi.uniwiki.domain.university.entity.University;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UniversityResponseDTO {

    private Short universityId;
    private String universityName;
    private String logoUrl;

    public static UniversityResponseDTO from(University university) {
        return UniversityResponseDTO.builder()
                .universityId(university.getId())
                .universityName(university.getName())
                .logoUrl(university.getLogoUrl())
                .build();
    }
}
