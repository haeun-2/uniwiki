package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Integer> {

    Optional<DocumentVersion> findByDocumentIdAndVersionNumber(Integer documentId, Integer versionNumber);
}
