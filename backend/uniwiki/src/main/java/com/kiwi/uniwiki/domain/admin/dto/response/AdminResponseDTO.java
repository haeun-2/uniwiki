package com.kiwi.uniwiki.domain.admin.dto.response;

import com.kiwi.uniwiki.domain.code.entity.Code;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AdminResponseDTO {

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserReportResponse {

        private Integer reportId;
        private String code;
        private String reporter;
        private String reported;
        private LocalDateTime createdAt;
    }
}
