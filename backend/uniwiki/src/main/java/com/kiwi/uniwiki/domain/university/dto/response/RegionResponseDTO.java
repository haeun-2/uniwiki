package com.kiwi.uniwiki.domain.university.dto.response;

import com.kiwi.uniwiki.domain.university.entity.Region;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RegionResponseDTO {

    private Integer regionId;
    private String regionName;

    public static RegionResponseDTO from(Region region) {
        return RegionResponseDTO.builder()
                .regionId(region.getId())
                .regionName(region.getName())
                .build();
    }
}