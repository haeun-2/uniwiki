package com.kiwi.uniwiki.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ======================================
    // COMMON ERRORS (공통 에러)
    // ======================================

    /**
     * 400 BAD_REQUEST - 입력값 검증 오류
     */
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "COMMON_400_01", "잘못된 입력값입니다."),
    MISSING_REQUIRED_FIELD(HttpStatus.BAD_REQUEST, "COMMON_400_02", "필수 입력값이 누락되었습니다."),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "COMMON_400_03", "잘못된 타입의 값입니다."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "COMMON_400", "잘못된 요청입니다."),

    /**
     * 404 NOT_FOUND - 공통 리소스 없음
     */
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON_404_01", "요청한 리소스를 찾을 수 없습니다."),

    /**
     * 409 CONFLICT - 중복 리소스
     */
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "COMMON_409_01", "이미 존재하는 리소스입니다."),

    /**
     * 500 INTERNAL_SERVER_ERROR - 서버 공통 오류
     */
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_500_01", "서버 내부 오류가 발생했습니다."),

    /**
     * 502
     */
    BAD_GATEWAY(HttpStatus.BAD_GATEWAY, "SERVER_503", "게이트웨이 오류가 발생했습니다."),

    /**
     * 503
     */
    SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "SERVER_503", "현재 서버를 사용할 수 없습니다."),

    // ======================================
    // AUTHENTICATION & AUTHORIZATION (인증/인가)
    // ======================================

    /**
     * 401 UNAUTHORIZED - 인증 실패
     */
    UNAUTHORIZED_ACCESS(HttpStatus.UNAUTHORIZED, "AUTH_401_01", "인증이 필요합니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AUTH_4011", "아이디 또는 비밀번호가 일치하지 않습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_4091", "이미 존재하는 이메일입니다."),
    NICKNAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_4092", "이미 존재하는 닉네임입니다."),
    /**
     * 403 FORBIDDEN - 접근 권한 없음
     */
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH_403_01", "접근 권한이 없습니다."),

    // ======================================
    // REGION (지역)
    // ======================================

    /**
     * 404 NOT_FOUND - 지역 없음
     */
    REGION_NOT_FOUND(HttpStatus.NOT_FOUND, "REGION_404_01", "요청한 지역을 찾을 수 없습니다."),

    // ======================================
    // UNIVERSITY (대학)
    // ======================================

    /**
     * 404 NOT_FOUND - 대학 없음
     */
    UNIVERSITY_NOT_FOUND(HttpStatus.NOT_FOUND, "UNIVERSITY_404_01", "요청한 대학을 찾을 수 없습니다."),

    // ======================================
    // CATEGORY (카테고리)
    // ======================================

    /**
     * 404 NOT_FOUND - 카테고리 없음
     */
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_404_01", "요청한 카테고리를 찾을 수 없습니다."),


    // ======================================
    // DOCUMENT (문서)
    // ======================================

    /**
     * 404 NOT_FOUND - 문서 없음
     */
    DOCUMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "DOCUMENT_404_01", "요청한 문서를 찾을 수 없습니다."),
    DOCUMENT_VERSION_NOT_FOUND(HttpStatus.NOT_FOUND, "DOCUMENT_404_02", "요청한 버전의 문서를 찾을 수 없습니다."),

    /**
     * 409 CONFLICT - 중복 리소스
     */
    DUPLICATE_DOCUMENT(HttpStatus.CONFLICT, "DOCUMENT_409_01", "이미 존재하는 문서입니다."),


    /**
     * 403 FORBIDDEN - 토론 권한 없음
     */
    DISCUSSION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "DISCUSSION_403_01", "소속 대학생만 토론에 참여할 수 있습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
