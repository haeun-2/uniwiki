package com.kiwi.uniwiki.security.controller;

import com.kiwi.uniwiki.security.dto.request.AuthRequestDTO;
import com.kiwi.uniwiki.security.dto.response.AuthResponseDTO;
import com.kiwi.uniwiki.security.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth") // <-- v1 로 수정
@RequiredArgsConstructor
@Tag(name = "AuthController", description = "읜증 컨트롤러입니다.")
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "회원가입 입니다. (닉네임 중복 체크, 이메일 중복 체크 필요)")
    public ResponseEntity<Void> signup(@RequestBody AuthRequestDTO.SignupRequest request) {
     authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    public ResponseEntity<AuthResponseDTO.LoginResponse> login(@RequestBody AuthRequestDTO.LoginRequest request) {
        AuthResponseDTO.LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 중복 검사
     */
    @GetMapping("/email/check")
    @Operation(summary = "이메일 중복 검사", description = "이메일 중복 검사 입니다.")
    public ResponseEntity<AuthResponseDTO.DuplicateCheck> checkEmailDuplicate(@RequestParam String email) {
        AuthResponseDTO.DuplicateCheck response =    authService.checkEmailDuplicate(email);
        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 중복검사
     */
    @GetMapping("/nickname/check")
    @Operation(summary = "닉네임 중복 검사", description = "닉네임 중복 검사 입니다.")
    public ResponseEntity<AuthResponseDTO.DuplicateCheck> checkNicknameDuplicate(@RequestParam String nickname) {
        AuthResponseDTO.DuplicateCheck response =    authService.checkNicknameDuplicate(nickname);
        return ResponseEntity.ok(response);
    }
}
