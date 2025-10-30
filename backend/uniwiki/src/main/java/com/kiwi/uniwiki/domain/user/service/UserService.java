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


    private final UniversityRepository universityRepository;
    private final UniversityBookmarkRepository universityBookmarkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentBookmarkRepository documentBookmarkRepository;

    public UserResponseDTO.UserInfo getUserInfo(User user){
      return UserResponseDTO.UserInfo.builder().
                email(user.getEmail()).
                nickname(user.getNickname())
                .role(user.getRole()).build();
    }

    public void createFavoriteDocument(User user, Integer documentId){
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        if(documentBookmarkRepository.existsByUserIdAndDocumentId(user.getId() , documentId)){
          throw  new CustomException(ErrorCode.BOOKMARK_DOCUMENT_ALREADY_EXISTS);
        }

        DocumentBookmark documentBookmark = DocumentBookmark.builder()
        .userId(user.getId())
                .documentId(documentId)
                        .user(user)
                                .document(document)
                                        .
                build();
        documentBookmarkRepository.save(documentBookmark);

    }
    public void deleteFavoriteDocument(Integer userId, Integer documentId){

        DocumentBookmark.DocumentBookmarkId id =
                new DocumentBookmark.DocumentBookmarkId(userId, documentId);

        DocumentBookmark documentBookmark = documentBookmarkRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_FAVORITE_NOT_FOUND));

        documentBookmarkRepository.delete(documentBookmark);
    }

    public List<UserResponseDTO.FavoriteDocumentList> getFavoriteDocumentList(User user){
        List<DocumentBookmark>  usersByBookMark = documentBookmarkRepository.findByUserId(user.getId());


        return usersByBookMark.stream()
                .map(bookmark -> UserResponseDTO.FavoriteDocumentList.builder()
                        .documentId(bookmark.getDocumentId())
                        .documentTitle(bookmark.getDocument().getTitle())
                        .universityName(bookmark.getDocument().getUniversity().getName())
                        .documentUpdateAt(bookmark.getDocument().getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

    }


    public void createFavoriteUniversity(User user, Short universityId){

        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNIVERSITY_NOT_FOUND));
        if(universityBookmarkRepository.existsByUserIdAndUniversityId(user.getId() , universityId)){
            throw  new CustomException(ErrorCode.BOOKMARK_UNIVERSITY_ALREADY_EXISTS);
        }
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
