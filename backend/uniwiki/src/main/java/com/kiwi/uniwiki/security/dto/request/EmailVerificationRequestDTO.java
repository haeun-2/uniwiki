package com.kiwi.uniwiki.security.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class EmailVerificationRequestDTO {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailUrlRequest{
        private String email;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerificationEmailCodeRequest{
        private String email;
        private String code;
    }


}
