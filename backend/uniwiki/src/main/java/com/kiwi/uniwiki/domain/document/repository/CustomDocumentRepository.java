package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.admin.dto.DocumentSearchFilterDTO;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomDocumentRepository {
    Page<AdminResponseDTO.DocumentSearchResult> searchDocuments(DocumentSearchFilterDTO filter, Pageable pageable);
}
