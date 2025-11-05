package com.kiwi.uniwiki.domain.user.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentBookmark;
import com.kiwi.uniwiki.domain.document.repository.DocumentBookmarkRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.entity.UniversityBookmark;
import com.kiwi.uniwiki.domain.university.repository.UniversityBookmarkRepository;
import com.kiwi.uniwiki.domain.university.repository.UniversityRepository;
import com.kiwi.uniwiki.domain.user.dto.request.UserRequestDTO;
import com.kiwi.uniwiki.domain.user.dto.response.UserResponseDTO;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import com.kiwi.uniwiki.security.util.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;


    public UserResponseDTO.UserInfo getUserInfo(User user){
      return UserResponseDTO.UserInfo.builder().
                email(user.getEmail()).
                nickname(user.getNickname())
                .role(user.getRole()).build();
    }


    //비밀번호 변경(로그인한 사용자만)
    @Transactional
    public void changePassword(User user, UserRequestDTO.ChangePasswordRequest request){



        // 1. 기존 비밀번호가 일치하는지 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        // 2. 새 비밀번호와 확인 비밀번호가 일치하는지 확인
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
        }

        // 3. 새 비밀번호가 기존 비밀번호와 같은지 확인 (선택사항)
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new CustomException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.updatePassword(encodedNewPassword);

        userRepository.save(user);

    }




}
