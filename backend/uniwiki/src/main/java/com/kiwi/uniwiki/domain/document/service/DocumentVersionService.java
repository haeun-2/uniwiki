package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.common.page.PageResponse;
import com.kiwi.uniwiki.domain.document.dto.DiffDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentDetailResponseDTO;
import com.kiwi.uniwiki.domain.document.dto.response.DocumentVersionResponseDTO;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentVersionService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    private final DocumentVersionUpdateService documentVersionUpdateService;

    /**
     * 문서 전체 버전 목록 조회
     */
    public PageResponse<DocumentVersionResponseDTO> getAllVersions(Integer documentId, Integer page, Integer size) {
        Page<DocumentVersion> documentVersions = documentVersionRepository.findAllByDocumentId(
                documentId,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("versionNumber"), Sort.Order.desc("createdAt")))
        );

        return PageResponse.from(documentVersions, DocumentVersionResponseDTO::from);
    }

    /**
     * 특정 버전 차이 조회
     */
    public DiffDTO.DiffInfoDTO getDiffOfVersion(Integer documentId, Integer documentVersionId) {

        DocumentVersion version = documentVersionRepository.findByDocumentIdAndVersionNumber(documentId, documentVersionId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        return DiffDTO.DiffInfoDTO.from(version);
    }

    /**
     * 특정 버전 문서 조회
     */
    public DocumentDetailResponseDTO getVersionOfDocument(Integer documentId, Integer documentVersionId) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        DocumentVersion version = documentVersionRepository.findByDocumentIdAndVersionNumber(document.getId(), documentVersionId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        return DocumentDetailResponseDTO.from(document, version);
    }

    /**
     * 특정 버전으로 되돌리기
     */
    @Transactional
    public String rollbackToVersion(Integer documentId, Integer targetVersionNumber, User user) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));

        DocumentVersion targetVersion = documentVersionRepository.findByDocumentIdAndVersionNumber(documentId, targetVersionNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        DocumentVersion currentVersion = documentVersionRepository.findByDocumentIdAndVersionNumber(document.getId(), document.getLatestVersionNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND));

        documentVersionUpdateService.createNewVersionAndUpdateDocument(
                document,
                user,
                targetVersion.getCategory(),
                currentVersion.getContent(),
                targetVersion.getContent(),
                String.format("%d 버전으로 되돌림", targetVersionNumber)
        );

        return document.getTitle();
    }
}