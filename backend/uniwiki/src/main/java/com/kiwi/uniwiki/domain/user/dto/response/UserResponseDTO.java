package com.kiwi.uniwiki.domain.user.dto.response;

import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

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
        private Integer universityId;
        private String logoUrl;
        private String universityName;
    }

}
