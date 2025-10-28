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

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final UniversityBookmarkRepository universityBookmarkRepository;

    public UserResponseDTO.UserInfo getUserInfo(User user){
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new CustomException(ErrorCode.USER_FOUND_FOUND));
      return UserResponseDTO.UserInfo.builder().
                email(user.getEmail()).
                nickname(user.getNickname())
                .role(user.getRole()).build();
    }

    public void createFavoriteUniversity(User user, Short universityId){

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

    public void deleteFavoriteUniversity(Integer userId, Short universityId){

        UniversityBookmark.UniversityBookmarkId id =
                new UniversityBookmark.UniversityBookmarkId(userId, universityId);

        UniversityBookmark university = universityBookmarkRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.UNIVERSITY_FAVORITE_NOT_FOUND));

        universityBookmarkRepository.delete(university);
    }

    public List<UserResponseDTO.FavoriteUniversityList> getFavoriteUniversityList(User user){
        List<UniversityBookmark>  usersByBookMark = universityBookmarkRepository.findByUserId(user.getId());
        return usersByBookMark.stream()
                .map(bookmark -> UserResponseDTO.FavoriteUniversityList.builder()
                        .universityId(bookmark.getUniversityId())
                        .logoUrl(bookmark.getUniversity().getLogoUrl())
                        .universityName(bookmark.getUniversity().getName())
                        .build())
                .collect(Collectors.toList());

        }

}
