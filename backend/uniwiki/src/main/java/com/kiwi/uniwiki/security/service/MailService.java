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
    //변경 메일 생성
    private MimeMessage createChangeDocumentMail(String recipientEmail, String documentTitle){
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            message.setFrom(senderEmail);
            message.setRecipients(MimeMessage.RecipientType.TO, recipientEmail);
            message.setSubject("UNIWIKI 즐겨찾기 알림");

            String body = documentChangeEmail(documentTitle);
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
        body.append("<h2 style='text-align:left;'>회원가입 인증 인증</h2>");
        body.append("<p style='text-align:left;'>안녕하세요.</p>");
        body.append("<p style='text-align:left;'>요청하신 인증번호입니다.</p>");
        body.append("<div style='background-color:#f8f9fa; padding:20px; border-radius:5px; margin:20px 0;'>");
        body.append("<h1 style='color:#007bff; text-align:left; letter-spacing:5px;'>");
        body.append(verificationCode);
        body.append("</h1>");
        body.append("</div>");
        body.append("<p style='color:#dc3545; text-align:left;'>※ 인증번호는 5 분간 유효합니다.</p>");
        body.append("<p style='text-align:left;'>감사합니다.</p>");
        body.append("</div>");
        return body.toString();
    }

    private String documentChangeEmail(String documentTitle) {
        StringBuilder body = new StringBuilder();
        body.append("<div style='margin:20px;'>");
        body.append("<h2 style='text-align:left;'>즐겨찾기 문서 변경 알림</h2>");
        body.append("<p style='text-align:left;'>안녕하세요.</p>");
        body.append("<p style='text-align:left;'>즐겨찾기하신 문서에 변경사항이 발생했습니다.</p>");
        body.append("<div style='background-color:#f8f9fa; padding:20px; border-radius:5px; margin:20px 0;'>");
        body.append("<h3 style='color:#007bff; margin:0; text-align:left;'>📄 ");
        body.append(documentTitle);
        body.append("</h3>");
        body.append("</div>");
        body.append("<p style='text-align:left;'>문서를 확인하시려면 아래 링크를 클릭해주세요.</p>");
        body.append("<div style='text-align:left; margin:20px 0;'>");
        body.append("<a href='https://k13d104.p.ssafy.io/' ");
        body.append("style='display:inline-block; padding:12px 30px; background-color:#007bff; color:white; ");
        body.append("text-decoration:none; border-radius:5px; font-weight:bold;'>");
        body.append("문서 확인하기");
        body.append("</a>");
        body.append("</div>");
        body.append("<p style='text-align:left;'>감사합니다.</p>");
        body.append("</div>");
        return body.toString();
    }


    //문서 변경 알림 시 메일 전송
    public void sendChangeDocumentMail(String email, String documentTitle){
        try {
            MimeMessage message = createChangeDocumentMail(email, documentTitle);
            javaMailSender.send(message);
            log.info("인증 메일 발송 성공: {}", email);

        } catch (Exception e) {
            log.error("메일 발송 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.MAIL_SEND_FAILED);
        }
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
