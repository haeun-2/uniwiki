package com.kiwi.uniwiki.domain.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AdminRequestDTO {

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReportRejectedRequest {

       private String reason;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReportSolvedRequest {

        private String reason;
        private LocalDateTime banUntil;
    }


    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionReportSolvedRequest {

        private String reason;
    }

}
