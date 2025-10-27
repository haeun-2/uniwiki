package com.kiwi.uniwiki.domain.university.dto.response;

import com.kiwi.uniwiki.domain.university.entity.University;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UniversityDetailResponseDTO {

    private String regionName;
    private String universityName;
    private String address;
    private String phone;
    private String website;
    private String logoUrl;

    public static UniversityDetailResponseDTO from(University university) {
        return UniversityDetailResponseDTO.builder()
                .regionName(university.getRegion().getName())
                .universityName(university.getName())
                .address(university.getAddress())
                .phone(university.getPhone())
                .website(university.getWebsite())
                .logoUrl(university.getLogoUrl())
                .build();
    }
}
