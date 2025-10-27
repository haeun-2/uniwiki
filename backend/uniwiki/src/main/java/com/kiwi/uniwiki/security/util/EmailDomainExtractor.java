package com.kiwi.uniwiki.security.util;


import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class EmailDomainExtractor {


    /**
     * 이메일에서 도메인 추출
     * 예: hongkildong@snu.ac.kr -> snu.ac.kr
     */
    public String extractDomain(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("이메일 주소가 비어있습니다.");
        }

        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("올바르지 않은 이메일 형식입니다.");
        }

        int atIndex = email.indexOf('@');
        if (atIndex == -1) {
            throw new IllegalArgumentException("올바르지 않은 이메일 형식입니다.");
        }

        return email.substring(atIndex + 1).toLowerCase();
    }

    /**
     * 이메일 형식 검증
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return true;
    }

    /**
     * 대학 이메일인지 확인 (.ac.kr 또는 .edu 도메인)
     */
    public boolean isUniversityEmail(String email) {
        if (!isValidEmail(email)) {
            return false;
        }

        String domain = extractDomain(email);
        return domain.endsWith(".ac.kr") ||
                domain.endsWith(".edu") ||
                domain.endsWith(".edu.kr");
    }
}
