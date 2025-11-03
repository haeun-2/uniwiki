package com.kiwi.uniwiki.domain.user.controller;

import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.activity.dto.response.UserActivityResponseDTO;

import com.kiwi.uniwiki.domain.activity.service.UserActivityService;

import com.kiwi.uniwiki.domain.document.service.DocumentBookmarkService;

import com.kiwi.uniwiki.domain.university.service.UniversityBookmarkService;
import com.kiwi.uniwiki.domain.user.dto.response.UserResponseDTO;
import com.kiwi.uniwiki.domain.user.service.UserService;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;


import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "UserController", description = "유저 관련 기능을 제공합니다.")
public class UserController {

    private final UserService userService;
    private final UniversityBookmarkService universityBookmarkService;
    private final DocumentBookmarkService documentBookmarkService;

    private final UserActivityService userActivityService;


    @GetMapping("/me")
    @Operation(summary = "유저 정보 조회" , description = "유저 정보를 조회합니다.")
    public ResponseEntity<UserResponseDTO.UserInfo> getUserInfo(@AuthenticationPrincipal CustomUserDetails user){
        UserResponseDTO.UserInfo response = userService.getUserInfo(user.getUser());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/favorites/universities/{universityId}")
    @Operation(summary = "대학 즐겨 찾기 추가" , description = "관심 있는 대학을 즐겨찾기에 추가합니다.")
    public ResponseEntity<Void> addBookmark(
          @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable("universityId") Short universityId) {

        universityBookmarkService.createFavoriteUniversity(user.getUser(), universityId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("/me/favorites/universities/{universityId}")
    @Operation(summary = "대학 즐겨 찾기 삭제" , description = "즐겨 찾기 한 목록중에 삭제 합니다.")
    public ResponseEntity<Void> deleteBookMark(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable("universityId") Short universityId) {

        universityBookmarkService.deleteFavoriteUniversity(user.getUser().getId(), universityId);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @GetMapping("/me/favorites/universities")
    @Operation(summary = "대학 즐겨 목록 조회" , description = "사용자가 등록한 대학 즐겨찾기의 목록을 조회합니다.")
    public ResponseEntity<List<UserResponseDTO.FavoriteUniversityList>> getUserFavoriteUniversitiesList(
            @AuthenticationPrincipal CustomUserDetails user
          ) {

        List<UserResponseDTO.FavoriteUniversityList> response = universityBookmarkService.getFavoriteUniversityList(user.getUser());
        return ResponseEntity.ok(response);
    }


    @PostMapping("/me/favorites/documents/{documentId}")
    @Operation(summary = "문서 즐겨 찾기 추가" , description = "관심 있는 문서 즐겨찾기에 추가합니다.")
    public ResponseEntity<Void> addDocumentBookmark(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable("documentId") Integer documentId) {

        documentBookmarkService.createFavoriteDocument(user.getUser(), documentId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("/me/favorites/documents/{documentId}")
    @Operation(summary = "문서 즐겨 찾기 삭제" , description = "즐겨 찾기 한 목록중에 삭제 합니다.")
    public ResponseEntity<Void> deleteDocumentBookMark(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable("documentId") Integer documentId) {

        documentBookmarkService.deleteFavoriteDocument(user.getUser().getId(), documentId);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @GetMapping("/me/favorites/documents")
    @Operation(summary = "문서 즐겨 찾기 목록 조회" , description = "사용자가 등록한 문서 즐겨찾기의 목록을 조회합니다.")
    public ResponseEntity<List<UserResponseDTO.FavoriteDocumentList>> getDocumentBookMarkList(
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        List<UserResponseDTO.FavoriteDocumentList> response = documentBookmarkService.getFavoriteDocumentList(user.getUser());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/documents")
    @Operation(summary = "내가 기여한 문서", description = "내가 기여한 문서 (작성했거나, 수정한) 문서를 조회합니다.")
    public ResponseEntity<PageResponse<UserActivityResponseDTO.UserDocumentActivityResponse>> getUserByDocuments(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<UserActivityResponseDTO.UserDocumentActivityResponse> response =
                userActivityService.getUserDocumentActivities(user.getUser().getId(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/discussions")
    @Operation(summary = "내가 기여한 토론" , description = "내가 기여한  토론 (생성, 댓글) 문서를 조회합니다.")
    public ResponseEntity<PageResponse<UserActivityResponseDTO.UserDiscussionActivityResponse>> getUserByDiscussion(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        PageResponse<UserActivityResponseDTO.UserDiscussionActivityResponse> response = userActivityService.getUserDiscussionActivities(user.getUser().getId(),page,size);

        return ResponseEntity.ok(response);
    }
}

