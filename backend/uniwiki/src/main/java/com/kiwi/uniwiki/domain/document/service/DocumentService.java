package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.dto.DiffDTO;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentCreateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.request.DocumentUpdateRequestDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.entity.Category;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.document.util.DocumentDiffUtil;
import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    private final CategoryService categoryService;
    private final DocumentDiffUtil documentDiffUtil;

    /**
     * 새 문서 생성
     */
    @Transactional
    public String createDocument(DocumentCreateRequestDTO request, User user) {

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

        // 클라이언트가 본 버전과 현재 버전 비교 (동시 수정 감지)
        if (!document.getLatestVersionNumber().equals(request.getBaseVersionNumber())) {
            log.debug("document {}: 동시 수정 발생", document.getId());
            throw new CustomException(ErrorCode.DOCUMENT_CONCURRENT_MODIFICATION);
        }

        Category category = categoryService.getCategoryById(request.getCategoryId());

        DocumentVersion oldVersion = documentVersionRepository.findByDocumentIdAndVersionNumber(document.getId(), document.getLatestVersionNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        // 버전 비교
        DiffDTO.DiffInfoDTO diffs = documentDiffUtil.getDiffs(oldVersion.getContent(), request.getDocumentContent());

        // 새 버전 저장
        DocumentVersion newVersion = documentVersionRepository.save(DocumentVersion.builder()
                .document(document)
                .editor(user)
                .category(category)
                .versionNumber(document.getLatestVersionNumber() + 1)
                .content(request.getDocumentContent())
                .contentDiff(diffs.getDiffs())
                .editMemo(request.getEditMemo())
                .plusCount(diffs.getPlusCount())
                .minusCount(diffs.getMinusCount())
                .build()
        );

        // 문서 업데이트 (낙관적 락)
        try {
            document.updateLatestVersionInfo(category, newVersion.getVersionNumber(), newVersion.getCreatedAt());
            documentRepository.save(document);
        } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e) {
            throw new CustomException(ErrorCode.DOCUMENT_CONCURRENT_MODIFICATION);
        }

        return document.getTitle();
    }
}
