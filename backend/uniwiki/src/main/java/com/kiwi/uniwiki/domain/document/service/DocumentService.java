package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.activity.service.AsyncUserActivityService;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentCreateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentUpdateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentResponseDTO;
import com.kiwi.uniwiki.domain.document.entity.Category;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    private final CategoryService categoryService;
    private final DocumentVersionUpdateService documentVersionUpdateService;

    private final AsyncUserActivityService asyncUserActivityService;

    /**
     * 새 문서 생성
     */
    @Transactional
    public String createDocument(DocumentCreateRequestDTO request, User user) {

        // 대학 확인
        if (!user.getIsUniversityVerified() || !Objects.equals(user.getUniversity().getId(), request.getUniversityId())) {
            throw new CustomException(ErrorCode.DOCUMENT_ACCESS_DENIED);
        }

        // 제목 중복 검사
        if (documentRepository.existsByTitle(request.getDocumentTitle())) {
            throw new CustomException(ErrorCode.DUPLICATE_DOCUMENT);
        }

        Document document = Document.builder()
                .university(user.getUniversity())
                .category(categoryService.getCategoryById(request.getCategoryId()))
                .title(request.getDocumentTitle())
                .build();

        Document savedDocument = documentRepository.save(document);

        DocumentVersion documentVersion = DocumentVersion.builder()
                .document(savedDocument)
                .editor(user)
                .category(savedDocument.getCategory())
                .versionNumber(savedDocument.getLatestVersionNumber())
                .content(request.getDocumentContent())
                .createdAt(savedDocument.getCreatedAt())
                .build();

        documentVersionRepository.save(documentVersion);

        // CREATE_DOCUMENT 활동 내역 저장
        asyncUserActivityService.createDocumentActivity(user, documentVersion, "CREATE_DOCUMENT");

        return document.getTitle();
    }

    /**
     * 특정 문서 조회
     */
    public DocumentDetailResponseDTO getDocumentByTitle(String documentTitle) {

        Document document = documentRepository.findByTitle(documentTitle)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        DocumentVersion latestVersion = documentVersionRepository.findByDocumentIdAndVersionNumber(document.getId(), document.getLatestVersionNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        return DocumentDetailResponseDTO.from(document, latestVersion.getContent());
    }

    /**
     * 특정 문서 새 버전 생성
     */
    @Transactional
    public String updateDocument(Integer documentId, DocumentUpdateRequestDTO request, User user) {

        // 문서, 카테고리, 최근 버전 조회
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        // 대학 확인
        if (!user.getIsUniversityVerified() || !Objects.equals(user.getUniversity().getId(), document.getUniversity().getId())) {
            throw new CustomException(ErrorCode.DOCUMENT_ACCESS_DENIED);
        }

        // 클라이언트가 본 버전과 현재 버전 비교 (동시 수정 감지)
        if (!document.getLatestVersionNumber().equals(request.getBaseVersionNumber())) {
            log.debug("document {}: 동시 수정 발생", document.getId());
            throw new CustomException(ErrorCode.DOCUMENT_CONCURRENT_MODIFICATION);
        }

        Category category = categoryService.getCategoryById(request.getCategoryId());

        DocumentVersion oldVersion = documentVersionRepository.findByDocumentIdAndVersionNumber(document.getId(), document.getLatestVersionNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        documentVersionUpdateService.createNewVersionAndUpdateDocument(
                document,
                user,
                category,
                oldVersion.getContent(),
                request.getDocumentContent(),
                request.getEditMemo()
        );

        return document.getTitle();
    }


    /**
     * 대학 최근 수정 문서 조회
     */
    public List<DocumentResponseDTO> getRecentByUniversity(Short universityId) {

        PageResponse<DocumentResponseDTO> pageResponse = getAllByUniversity(universityId, 0, 10);

        // PageResponse에서 content만 반환
        return pageResponse.getContent();
    }

    /**
     * 대학별 문서 조회
     */
    public PageResponse<DocumentResponseDTO> getAllByUniversity(Short universityId, Integer page, Integer size) {
        Page<Document> documents = documentRepository.findAllByUniversityId(
                universityId,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("updatedAt")))
        );

        return PageResponse.from(documents, DocumentResponseDTO::from);
    }
}