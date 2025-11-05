package com.kiwi.uniwiki.domain.admin.dto.response;

import com.kiwi.uniwiki.domain.code.entity.Code;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AdminResponseDTO {

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserReportResponse {

        private Integer reportedId;
        private String reportedName;

      List<UserReportValue> reportValueList;
    }


    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserReportValue{
        private Integer reportId;
        private String code;
        private String reporterName;
        private LocalDateTime createdAt;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionReportResponse {

        private Integer discussionId;

        List<DiscussionReportValue> discussionValueList;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionReportValue{
        private Integer reportId;
        private String reporterName;
        private String reason;
        private String code;
        private LocalDateTime createdAt;
    }
}
