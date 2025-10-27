package com.kiwi.uniwiki.security.dto.response;

import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AuthResponseDTO {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse{
        private String accessToken;
        private Integer userId;
        private String nickName;
        private User.Role role;
    }

}
