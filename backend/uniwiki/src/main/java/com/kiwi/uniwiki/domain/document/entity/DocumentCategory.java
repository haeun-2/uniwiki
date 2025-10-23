package com.kiwi.uniwiki.domain.document.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Entity
@Table(name = "document_categories")
@IdClass(DocumentCategory.DocumentCategoryId.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentCategory {

    @Id
    @Column(name = "category_id")
    private Integer categoryId;

    @Id
    @Column(name = "document_id")
    private Integer documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", insertable = false, updatable = false)
    private Document document;

    @Getter
    @EqualsAndHashCode
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class DocumentCategoryId implements Serializable {
        private Integer categoryId;
        private Integer documentId;
    }
}