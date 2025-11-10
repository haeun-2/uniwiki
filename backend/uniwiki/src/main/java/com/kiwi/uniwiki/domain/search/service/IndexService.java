package com.kiwi.uniwiki.domain.search.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import com.kiwi.uniwiki.domain.document.repository.DocumentVersionRepository;
import com.kiwi.uniwiki.domain.search.document.DocumentIndex;
import com.kiwi.uniwiki.domain.search.repository.DocumentSearchRepository;
import com.kiwi.uniwiki.domain.search.util.MarkdownUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.elasticsearch.ElasticsearchVectorStore;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexService {

    private final DocumentSearchRepository documentSearchRepository;
    private final ElasticsearchVectorStore vectorStore;
    private final DocumentVersionRepository documentVersionRepository;

    @Transactional(readOnly = true)
    public void indexDocument(Integer documentId) {
        DocumentVersion documentVersion = documentVersionRepository.findLatestVersionByDocumentId(documentId).orElseThrow(() -> new CustomException(ErrorCode.DOCUMENT_NOT_FOUND));
        Document document = documentVersion.getDocument();
        String plainText  = MarkdownUtil.removeMarkdown(documentVersion.getContent());

        DocumentIndex documentIndex = DocumentIndex.of(document, documentVersion, plainText);

        indexDocument(documentIndex);
    }

    /**
     * 문서와 문서 버전을 기반으로
     * Elasticsearch에 인덱스 저장 & vector store에 임베딩 저장
     */
    private void indexDocument(DocumentIndex documentIndex) {
        log.debug("[ElasticSearch INDEX] 요청 - 문서: ({}){}, 버전 {}", documentIndex.getId(), documentIndex.getTitle(), documentIndex.getVersionNumber());

        // 1. 문서의 기존 임베딩(Vector Store) 데이터 제거
        vectorStore.delete("documentId == '" + documentIndex.getId() + "'");
        log.debug("[ElasticSearch INDEX] 기존 임베딩 제거 - 문서: ({}){}", documentIndex.getId(), documentIndex.getTitle());

        // 2. 문서 메타데이터를 Elasticsearch에 저장
        documentSearchRepository.save(documentIndex);
        log.debug("[ElasticSearch INDEX] ES 인덱스 저장 - 문서: ({}){}, 버전 {}", documentIndex.getId(), documentIndex.getTitle(), documentIndex.getVersionNumber());

        // 4. vector store 저장을 위한 문서 생성
        List<org.springframework.ai.document.Document> chunks = makeVectorChunk(documentIndex);
        log.debug("[ElasticSearch INDEX] 청크 생성 완료 - 문서: ({}){}, 청크 수: {}", documentIndex.getId(), documentIndex.getTitle(), chunks.size());

        // 5. vector store에 저장
        vectorStore.add(chunks);

        log.debug("[ElasticSearch INDEX] 완료 - 문서: ({}){}, 버전 {}", documentIndex.getId(), documentIndex.getTitle(), documentIndex.getVersionNumber());
    }

    @Transactional
    public void indexDocumentsBulk(List<DocumentVersion> documentVersions) {
        // 1. vector store에서 기존 임베딩 삭제
        for (DocumentVersion documentVersion : documentVersions) {
            vectorStore.delete("documentId == '" + documentVersion.getDocument().getId() + "'");
        }
        log.info("[Bulk Delete] {} documents deleted.", documentVersions.size());

        // 2. bulk update할 문서 목록
        List<DocumentIndex> documentIndexes = new ArrayList<>();
        List<org.springframework.ai.document.Document> vectorDocuments = new ArrayList<>();

        for (DocumentVersion documentVersion : documentVersions) {
            // DocumentIndex 생성
            Document document = documentVersion.getDocument();
            String plainText = MarkdownUtil.removeMarkdown(documentVersion.getContent());
            DocumentIndex documentIndex = DocumentIndex.of(document, documentVersion, plainText);

            documentIndexes.add(documentIndex);

            // vector store 저장을 위한 document 생성
            List<org.springframework.ai.document.Document> chunks = makeVectorChunk(documentIndex);
            vectorDocuments.addAll(chunks);
        }

        // 3. bulk update
        documentSearchRepository.saveAll(documentIndexes); // ES bulk save
        vectorStore.add(vectorDocuments); // Vector Store bulk save

        log.info("[Bulk Index] {} documents indexed.", documentVersions.size());
    }

    private List<org.springframework.ai.document.Document> makeVectorChunk(DocumentIndex documentIndex) {
        // 1. vector store 저장을 위한 document 생성
        String content = documentIndex.getContent();
        Map<String, Object> metadata = Map.of(
                "documentId", documentIndex.getId(),
                "versionNumber", documentIndex.getVersionNumber()
        );
        org.springframework.ai.document.Document vectorDocument = new org.springframework.ai.document.Document(content, metadata);
        
        // 2. chunk 단위로 분할
        List<org.springframework.ai.document.Document> chunks = new TokenTextSplitter().apply(List.of(vectorDocument));
        return chunks.isEmpty() ? List.of(vectorDocument) : chunks; // 청크가 없으면 원본 문서를 그대로 반환
    }

    @Async
    public void deleteIndex(Integer documentId) {
        // document-index에서 삭제
        documentSearchRepository.deleteById(documentId);
        // vector db에서 삭제
        vectorStore.delete("documentId == '" + documentId + "'");
    }

}
