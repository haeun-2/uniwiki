package com.kiwi.uniwiki.common.exception;

import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {

    private int status;
    private String code;
    private String message;
    private LocalDateTime time;

    public static ResponseEntity<ErrorResponse> toResponseEntity(ErrorCode errorCode) {
        return toResponseEntity(errorCode, errorCode.getMessage());
    }

    // 커스텀 메시지를 받는 메서드 추가
    public static ResponseEntity<ErrorResponse> toResponseEntity(ErrorCode errorCode, String customMessage) {
        return ResponseEntity.status(errorCode.getStatus().value())
                .body(ErrorResponse.builder()
                        .status(errorCode.getStatus().value())
                        .code(errorCode.getCode())
                        .message(customMessage != null ? customMessage : errorCode.getMessage())
                        .time(LocalDateTime.now())
                        .build());
    }
}
