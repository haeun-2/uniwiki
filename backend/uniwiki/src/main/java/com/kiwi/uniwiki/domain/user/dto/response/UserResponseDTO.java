package com.kiwi.uniwiki.domain.user.dto.response;

import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserResponseDTO {

    @Builder
    @Getter
    public static class UserInfo{
        private String nickname;
        private String email;
        private User.Role role;
    }

    @Getter
    @Builder
    public static class FavoriteUniversityList{
        private Short universityId;
        private String logoUrl;
        private String universityName;
    }

    @Getter
    @Builder
    public static class FavoriteDocumentList{
        private Integer documentId;
        private String documentTitle;
        private String universityName;
        //문서의 최근 수정시간
        private LocalDateTime documentUpdateAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushAgree{
        private Boolean pushAgree;
    }

}
