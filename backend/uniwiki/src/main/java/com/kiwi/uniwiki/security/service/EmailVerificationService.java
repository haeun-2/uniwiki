package com.kiwi.uniwiki.security.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.security.dto.request.EmailVerificationRequestDTO;
import io.swagger.v3.oas.models.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final MailService mailService;

    private static final String EMAIL_VERIFICATION_PREFIX = "email:verification:";
    private static final int CODE_EXPIRATION_MINUTES = 5;


    /**
     * 6자리 랜덤 인증번호 생성
     */
    private String createVerificationCode() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    /**
     * 인증번호 발송 및 Redis 저장
     */
    public void sendVerificationCode(String email) {
        String verificationCode = createVerificationCode();
        String redisKey = EMAIL_VERIFICATION_PREFIX + email;

        // Redis에 인증번호 저장 (5분 TTL)
        redisTemplate.opsForValue().set(
                redisKey,
                verificationCode,
                Duration.ofMinutes(CODE_EXPIRATION_MINUTES)
        );

        // 메일 발송
        mailService.sendVerificationMail(email, verificationCode);

        log.info("인증번호 발송 및 저장 완료 - Email: {}", email);
    }


    /**
     * 인증번호 검증
     */
    public void verifyCode(EmailVerificationRequestDTO.VerificationEmailCodeRequest request) {
        String redisKey = EMAIL_VERIFICATION_PREFIX + request.getEmail();
        String savedCode = redisTemplate.opsForValue().get(redisKey);

        if (savedCode == null) {
            log.warn("인증번호 만료 또는 존재하지 않음 - Email: {}", request.getEmail());
             throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
        }

        boolean isValid = savedCode.equals(request.getCode());

        if (isValid) {
            // 인증 성공 시 Redis에서 삭제
            redisTemplate.delete(redisKey);
            log.info("인증 성공 - Email: {}", request.getEmail());

        } else {
            log.warn("인증번호 불일치 - Email: {}", request.getEmail());
            throw new  CustomException(ErrorCode.INVALID_EMAIL_CODE);

        }

    }

    /**
     * 비밀번호 변경시 인증번호 검증
     */
    public boolean changePassVerifyCode(EmailVerificationRequestDTO.VerificationEmailCodeRequest request) {
        String redisKey = EMAIL_VERIFICATION_PREFIX + request.getEmail();
        String savedCode = redisTemplate.opsForValue().get(redisKey);

        if (savedCode == null) {
            log.warn("인증번호 만료 또는 존재하지 않음 - Email: {}", request.getEmail());
            throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
        }

        boolean isValid = savedCode.equals(request.getCode());

        if (isValid) {
            // 인증 성공 시 Redis에서 삭제
            redisTemplate.delete(redisKey);
            log.info("인증 성공 - Email: {}", request.getEmail());
            return true;
        } else {
            log.warn("인증번호 불일치 - Email: {}", request.getEmail());
            return false;
        }

    }
    /**
     * 인증번호 재발송 (기존 코드 삭제 후 새로 발송)
     */
    public void resendVerificationCode(String email) {
        String redisKey =  EMAIL_VERIFICATION_PREFIX + email;
        redisTemplate.delete(redisKey);
        sendVerificationCode(email);
        log.info("인증번호 재발송 - Email: {}", email);
    }


}
