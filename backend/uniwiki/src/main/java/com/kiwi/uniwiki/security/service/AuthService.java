package com.kiwi.uniwiki.security.service;



import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.service.UniversityService;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import com.kiwi.uniwiki.security.dto.request.AuthRequestDTO;
import com.kiwi.uniwiki.security.dto.response.AuthResponseDTO;
import com.kiwi.uniwiki.security.util.JwtTokenProvider;
import com.kiwi.uniwiki.security.util.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UniversityService universityService;

    /**
     * 회원가입
     */
    @Transactional
    public String signup(AuthRequestDTO.SignupRequest request) {
        // 중복 사용자 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }

        // 비밀번호 SHA-256 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        //이메일로 대학 찾기
        University university = universityService.getUniversity(request.getEmail());
        // 사용자 생성
        User user = User.builder()
                        .university(university)
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .role(User.Role.USER)
                .isUniversityVerified(university== null ? false : true)
                .lastVerifiedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();



        userRepository.save(user);

        return "회원가입이 완료되었습니다.";
    }

    /**
     * 로그인
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO.LoginResponse login(AuthRequestDTO.LoginRequest request) {
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().toString());

        return AuthResponseDTO.LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .nickName(user.getNickname())
                .role(user.getRole())
                .build();
    }
}
