package com.kiwi.uniwiki.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    protected ResponseEntity<ErrorResponse> handleCustomException(CustomException e, HttpServletRequest request) {
        log.error("=== CustomException 발생 ===");
        log.error("에러 코드: {}", e.getErrorCode());
        log.error("에러 메시지: {}", e.getMessage());
        log.error("요청 URL: {}", request.getRequestURI());

        return ErrorResponse.toResponseEntity(e.getErrorCode(), e.getCustomMessage());
    }

    @ExceptionHandler(HttpClientErrorException.class)
    protected ResponseEntity<ErrorResponse> handleHttpClientError(HttpClientErrorException e, HttpServletRequest request) {
        HttpStatusCode status = e.getStatusCode();
        ErrorCode errorCode = switch (status.value()) {
            case 400 -> ErrorCode.BAD_REQUEST;
            case 401 -> ErrorCode.UNAUTHORIZED_ACCESS;
            case 403 -> ErrorCode.ACCESS_DENIED;
            case 404 -> ErrorCode.RESOURCE_NOT_FOUND;
            default -> ErrorCode.INTERNAL_SERVER_ERROR;
        };

        log.error("=== 클라이언트 에러 발생 ====");
        log.error("에러 코드: {}", errorCode);
        log.error("에러 타입: {}", e.getClass().getSimpleName());
        log.error("에러 메시지: {}", e.getMessage());
        log.error("요청 URL: {}", request.getRequestURI());


        return ErrorResponse.toResponseEntity(errorCode);
    }

    @ExceptionHandler(HttpServerErrorException.class)
    protected ResponseEntity<ErrorResponse> handleHttpServerError(HttpServerErrorException e, HttpServletRequest request) {
        HttpStatusCode status = e.getStatusCode();
        ErrorCode errorCode = switch (status.value()) {
            case 502 -> ErrorCode.BAD_GATEWAY;
            case 503 -> ErrorCode.SERVICE_UNAVAILABLE;
            default -> ErrorCode.INTERNAL_SERVER_ERROR;
        };

        log.error("=== 서버 에러 발생 ====");
        log.error("에러 코드: {}", errorCode);
        log.error("에러 타입: {}", e.getClass().getSimpleName());
        log.error("에러 메시지: {}", e.getMessage());
        log.error("요청 URL: {}", request.getRequestURI());

        return ErrorResponse.toResponseEntity(errorCode);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    protected ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException e, HttpServletRequest request) {
        CustomException customException = new CustomException(ErrorCode.BAD_REQUEST, "잘못된 JSON 형식입니다");
        return handleCustomException(customException, request);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<?> handleValidationExceptions(BindException e, HttpServletRequest request) {
        log.error("=== 요청 검증 에러 발생 ====");
        e.getBindingResult().getFieldErrors().forEach(fieldError ->
                log.error("Field: {}, Message: {}", fieldError.getField(), fieldError.getDefaultMessage())
        );

        String message = Optional.ofNullable(e.getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElseGet(() -> Optional.ofNullable(e.getGlobalError())
                        .map(ObjectError::getDefaultMessage)
                        .orElse("유효성 검증 실패"));

        CustomException customException = new CustomException(ErrorCode.BAD_REQUEST, message);
        return handleCustomException(customException, request);
    }

    @ExceptionHandler({NoHandlerFoundException.class, HttpRequestMethodNotSupportedException.class})
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(Exception e, HttpServletRequest request) {
        CustomException customException = new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "잘못된 요청 경로 혹은 요청 메서드입니다.");
        return handleCustomException(customException, request);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();

        log.error("=== 일반 Exception 발생 ===");
        log.error("에러 타입: {}", e.getClass().getSimpleName());
        log.error("에러 메시지: {}", e.getMessage());
        log.error("요청 URL: {}", requestURI);

        return ErrorResponse.toResponseEntity(ErrorCode.INTERNAL_SERVER_ERROR);
    }


    // Bean Validation 오류 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .code("VALIDATION_ERROR")
                        .message("입력값 검증 실패")
                        .build());
    }

    // JPA 제약조건 위반 오류 처리 (DB 레벨)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        String message = "데이터 제약조건 위반";

        if (ex.getMessage().contains("Duplicate entry")) {
            message = "이미 존재하는 값입니다";
        } else if (ex.getMessage().contains("Data too long")) {
            message = "입력값이 허용된 길이를 초과했습니다";
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .code("DATA_INTEGRITY_VIOLATION")
                        .message(message)
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        log.error("=== IllegalArgumentException 발생 ===");
        log.error("에러 메시지: {}", ex.getMessage());
        log.error("요청 URL: {}", request.getRequestURI());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .code("BAD_REQUEST")
                        .message("올바르지 않은 입력값 형식 입니다.")
                        .build());
    }

}
