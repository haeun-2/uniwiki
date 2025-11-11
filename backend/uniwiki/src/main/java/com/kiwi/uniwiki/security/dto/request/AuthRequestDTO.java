package com.kiwi.uniwiki.security.dto.request;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class AuthRequestDTO {

    /*
     로그인 요청
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest{
        private String email;
        private String password;
    }
    /*
         회원가입 요청
         */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignupRequest {
        private String email;
        private String nickname;
        private String password;
        private boolean pushAgree;

    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FindPasswordRequest {
        private String email;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FindChangePasswordRequest{

        private String email;
        private String code;
        private String newPassword;
        private String confirmPassword;
    }


}
