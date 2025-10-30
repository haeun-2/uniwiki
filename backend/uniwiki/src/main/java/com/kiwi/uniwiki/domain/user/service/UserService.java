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
import com.kiwi.uniwiki.domain.user.dto.response.UserResponseDTO;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {





    public UserResponseDTO.UserInfo getUserInfo(User user){
      return UserResponseDTO.UserInfo.builder().
                email(user.getEmail()).
                nickname(user.getNickname())
                .role(user.getRole()).build();
    }





}
