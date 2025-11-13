package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentBookmark;
import com.kiwi.uniwiki.domain.document.repository.DocumentBookmarkRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.user.dto.response.UserResponseDTO;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.security.service.EmailVerificationService;
import com.kiwi.uniwiki.security.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentBookmarkService {

    private final DocumentRepository documentRepository;
    private final DocumentBookmarkRepository documentBookmarkRepository;
    private final MailService mailService;

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

    //해당 문서가 수정됬을때 즐겨찾기 한 회원에게 메일 알림 발송
    public void sendEmail(Integer documentId){
        List<DocumentBookmark> documentBookmarksByDocument = documentBookmarkRepository.findByDocumentId(documentId);

        for(DocumentBookmark bookmark : documentBookmarksByDocument){
            mailService.sendChangeDocumentMail(bookmark.getUser().getEmail(), bookmark.getDocument().getTitle());
        }
    }
}
