package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Integer> {

    Optional<DocumentVersion> findByDocumentIdAndVersionNumber(Integer documentId, Integer versionNumber);

    Integer countByDocumentId(Integer documentId);

    Page<DocumentVersion> findAllByDocumentId(@Param("documentId") Integer documentId, Pageable pageable);
}
