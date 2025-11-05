package com.kiwi.uniwiki.security.service;



import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.repository.UniversityRepository;
import com.kiwi.uniwiki.domain.university.service.UniversityService;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.repository.UserBanRepository;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import com.kiwi.uniwiki.security.dto.request.AuthRequestDTO;
import com.kiwi.uniwiki.security.dto.request.EmailVerificationRequestDTO;
import com.kiwi.uniwiki.security.dto.response.AuthResponseDTO;
import com.kiwi.uniwiki.security.util.JwtTokenProvider;
import com.kiwi.uniwiki.security.util.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UniversityService universityService;
    private final EmailVerificationService emailVerificationService;

    /**
     * 회원가입
     */
    @Transactional
    public void signup(AuthRequestDTO.SignupRequest request) {
        // 중복 이메일 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        //중복 닉네임 검사
        if(userRepository.existsByNickname(request.getNickname())){
            throw new CustomException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }


        String encodedPassword = passwordEncoder.encode(request.getPassword());

        University university = universityService.getUniversity(request.getEmail());

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
    }

    /**
     * 로그인
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO.LoginResponse login(AuthRequestDTO.LoginRequest request) {
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));


        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw  new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }



        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().toString());



        return AuthResponseDTO.LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .nickName(user.getNickname())
                .role(user.getRole())
                .universityId(user.getUniversity() != null ? user.getUniversity().getId() : null)
                .build();
    }

    /**
     * 이메일 중복 검사
     */
    public AuthResponseDTO.DuplicateCheck checkEmailDuplicate(String email){
       boolean available = userRepository.existsByEmail(email);

        return AuthResponseDTO.DuplicateCheck.builder()
                .available(!available).build();

    }

    //닉네임 중복 검사
    public AuthResponseDTO.DuplicateCheck checkNicknameDuplicate(String nickname){
        boolean available = userRepository.existsByNickname(nickname);
        return AuthResponseDTO.DuplicateCheck.builder()
                .available(!available).build();
    }

    //로그인 하지 않은 사용자가 비밀번호 찾기 (변경)
    @Transactional
    public void requestChangePassword(AuthRequestDTO.FindPasswordRequest request){
        emailVerificationService.sendVerificationCode(request.getEmail());
    }

    //로그인 하지 않은 사용자가 비밀번호 변경하기
    @Transactional
    public void ChangePassword(AuthRequestDTO.ChangePasswordRequest request){
        EmailVerificationRequestDTO.VerificationEmailCodeRequest emailRequest = EmailVerificationRequestDTO.VerificationEmailCodeRequest.builder()
                        .email(request.getEmail())
                        .code(request.getCode()).
        build();
        if(emailVerificationService.changePassVerifyCode(emailRequest)){
            Optional<User> user = userRepository.findByEmail(request.getEmail());
            if(!user.isEmpty()){
                String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
               user.get().updatePassword(encodedNewPassword);
            }

        }

    }




}
