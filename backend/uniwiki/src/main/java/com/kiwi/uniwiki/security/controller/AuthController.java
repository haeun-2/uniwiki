package com.kiwi.uniwiki.security.controller;

import com.kiwi.uniwiki.security.dto.request.AuthRequestDTO;
import com.kiwi.uniwiki.security.dto.response.AuthResponseDTO;
import com.kiwi.uniwiki.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth") // <-- v1 로 수정
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AuthRequestDTO.SignupRequest request) {
        String message = authService.signup(request);
        return ResponseEntity.ok(message);
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO.LoginResponse> login(@RequestBody AuthRequestDTO.LoginRequest request) {
        AuthResponseDTO.LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
