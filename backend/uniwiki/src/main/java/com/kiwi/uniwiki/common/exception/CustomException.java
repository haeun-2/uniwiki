package com.kiwi.uniwiki.common.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

  private final ErrorCode errorCode;
  private final String customMessage;

  public CustomException(ErrorCode errorCode) {
    this(errorCode, null);
  }

  public CustomException(ErrorCode errorCode, String customMessage) {
    super(customMessage != null ? customMessage : errorCode.getMessage());
    this.errorCode = errorCode;
    this.customMessage = customMessage;
  }
}
