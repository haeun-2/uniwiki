package com.kiwi.uniwiki.domain.user.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final UniversityBookmarkRepository universityBookmarkRepository;

    public UserResponseDTO.UserInfo getUserInfo(Integer userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_FOUND_FOUND));;
      return UserResponseDTO.UserInfo.builder().
                email(user.getEmail()).
                nickname(user.getNickname())
                .role(user.getRole()).build();
    }

    public void createFavoriteDocument(Integer userId, Short universityId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_FOUND_FOUND));
        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNIVERSITY_NOT_FOUND));

        UniversityBookmark bookmark  = UniversityBookmark.builder()
                .userId(user.getId())
                .universityId(university.getId())
                .user(user)
                .university(university)
                .build();
        universityBookmarkRepository.save(bookmark);

    }

    public void deleteFavoriteDocument(Integer userId, Short universityId){

        UniversityBookmark.UniversityBookmarkId id =
                new UniversityBookmark.UniversityBookmarkId(userId, universityId);

        UniversityBookmark university = universityBookmarkRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.UNIVERSITY_FAVORITE_NOT_FOUND));

        universityBookmarkRepository.delete(university);
    }

}
