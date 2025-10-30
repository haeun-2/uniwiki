package com.kiwi.uniwiki.domain.report.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

public class ReportRequestDTO {

    @Getter
    @AllArgsConstructor
    public static class CreateReport {
        @NotNull(message = "신고 대상 ID는 필수입니다.")
        private Integer targetId;

        @NotBlank(message = "신고 사유는 필수입니다.")
        private String reason;
    }

}
