package com.kiwi.uniwiki.domain.admin.dto.response;

import com.kiwi.uniwiki.domain.code.entity.Code;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
        private LocalDateTime banUntil;

        private List<UserReportValue> reportValueList;
    }


    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserReportValue{
        private Integer reportId;
        private String code;
        private String reporterName;
        private String reason;
        private LocalDateTime createdAt;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionReportResponse {

        private Integer discussionContentId;
        private Integer discussionId;
        private String UniversityName;
        private String documentName;
/// ///
        private List<DiscussionReportValue> discussionValueList;
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

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentVersionList{
        private String universityName;
        private String categoryName;
        private String documentTitle;
        private LocalDateTime createdAt;
        private Integer plusCount;
        private Integer minusCount;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionList{
        private Integer discussionId;
        private String discussionTitle;
        private String code;
        private String universityName;
        private String documentTitle;
        private LocalDateTime createdAt;
    }

    //관리자가 토론 댓글 id로 해당 토론의 댓글의 내용을 가져옴 -> 이걸 보고 수정을 한다고 함
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DiscussionContentValue{

        private Integer discussionContentId;
        private Integer discussionId;
        private String discussionTitle;
        private String discussionContent;
        private LocalDateTime createdAt;


    }
}
