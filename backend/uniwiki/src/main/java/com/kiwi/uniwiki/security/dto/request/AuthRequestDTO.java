package com.kiwi.uniwiki.security.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        @Size(max = 320, message = "이메일은 320자를 초과할 수 없습니다")
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, max = 64, message = "비밀번호는 8자 이상 64자 이하여야 합니다")
        private String password;

        @NotBlank(message = "닉네임은 필수입니다")
        @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하여야 합니다")
        private String nickname;
        private Boolean isPushAgree;

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
