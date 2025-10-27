package com.kiwi.uniwiki.domain.document.entity;

import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "document_bookmarks")
@EntityListeners(AuditingEntityListener.class)
@IdClass(DocumentBookmark.DocumentBookmarkId.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentBookmark {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Id
    @Column(name = "document_id")
    private Integer documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", insertable = false, updatable = false)
    private Document document;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Getter
    @EqualsAndHashCode
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class DocumentBookmarkId implements Serializable {
        private Integer userId;
        private Integer documentId;
    }
}