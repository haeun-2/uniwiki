package com.kiwi.uniwiki.domain.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class UserRequestDTO {

    //비밀번호 변경 요청
    @Getter
    @AllArgsConstructor
    public static class ChangePasswordRequest{
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
    }

}
