package com.kiwi.uniwiki.security.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * 인증 메일 생성
     */
    private MimeMessage createMail(String recipientEmail, String verificationCode) {
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            message.setFrom(senderEmail);
            message.setRecipients(MimeMessage.RecipientType.TO, recipientEmail);
            message.setSubject("UNIWIKI 인증번호");

            String body = buildEmailBody(verificationCode);
            message.setText(body, "UTF-8", "html");

        } catch (MessagingException e) {
            log.error("메일 생성 실패: {}", e.getMessage());
            throw new RuntimeException("메일 생성에 실패했습니다.", e);
        }

        return message;
    }

    /**
     * 이메일 본문 구성
     */
    private String buildEmailBody(String verificationCode) {
        StringBuilder body = new StringBuilder();
        body.append("<div style='margin:20px;'>");
        body.append("<h2>회원가입 인증 인증</h2>");
        body.append("<p>안녕하세요.</p>");
        body.append("<p>요청하신 인증번호입니다.</p>");
        body.append("<div style='background-color:#f8f9fa; padding:20px; border-radius:5px; margin:20px 0;'>");
        body.append("<h1 style='color:#007bff; text-align:center; letter-spacing:5px;'>");
        body.append(verificationCode);
        body.append("</h1>");
        body.append("</div>");
        body.append("<p style='color:#dc3545;'>※ 인증번호는 5 분간 유효합니다.</p>");
        body.append("<p>감사합니다.</p>");
        body.append("</div>");
        return body.toString();
    }

    /**
     * 인증 메일 발송
     */
    public void sendVerificationMail(String email, String verificationCode) {
        try {
            MimeMessage message = createMail(email, verificationCode);
            javaMailSender.send(message);
            log.info("인증 메일 발송 성공: {}", email);

        } catch (Exception e) {
            log.error("메일 발송 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.MAIL_SEND_FAILED);
        }
    }
}
