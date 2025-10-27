package com.kiwi.uniwiki.domain.university.dto.response;

import com.kiwi.uniwiki.domain.university.entity.Region;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class RegionResponseDTO {

    private List<RegionDTO> regions;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RegionDTO {
        private Integer regionId;
        private String regionName;

        public static RegionDTO from(Region region) {
            return RegionDTO.builder()
                    .regionId(region.getId())
                    .regionName(region.getName())
                    .build();
        }
    }
}