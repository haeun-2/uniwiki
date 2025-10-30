package com.kiwi.uniwiki.domain.document.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.dto.DiffDTO;
import com.kiwi.uniwiki.domain.document.entity.Category;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentRepository;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.document.util.DocumentDiffUtil;
import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentVersionUpdateService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    private final DocumentDiffUtil documentDiffUtil;

    /**
     * 새 버전 생성 및 문서 업데이트 메서드
     */
    @Transactional
    public void createNewVersionAndUpdateDocument(Document document, User editor, Category category,
                                                  String oldContent, String newContent, String editMemo) {

        // 버전 비교
        DiffDTO.DiffInfoDTO diffs = documentDiffUtil.getDiffs(oldContent, newContent);

        // 새 버전 저장
        DocumentVersion newVersion = documentVersionRepository.save(DocumentVersion.builder()
                .document(document)
                .editor(editor)
                .category(category)
                .versionNumber(document.getLatestVersionNumber() + 1)
                .content(newContent)
                .contentDiff(diffs.getDiffs())
                .editMemo(editMemo)
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
    }
}
