package com.kiwi.uniwiki.domain.discussion.entity;

import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Entity
@Table(name = "discussions")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Discussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discussion_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleter_id")
    private User deleter;

    @Column(name = "title", nullable = false)
    private String title;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "latest_content_number", nullable = false)
    private Integer latestContentNumber = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_id", nullable = false)
    private Code code;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "discussion")
    private List<DiscussionContent> discussionContents = new ArrayList<>();

    @Builder
    public Discussion(Document document, User creator, String title, Code code) {
        this.document = document;
        this.creator = creator;
        this.title = title;
        this.code = code;
    }

    public void updateStatus(Code code) {
        this.code = code;
    }

    public int renewContentNumber() {
        return ++this.latestContentNumber;
    }

    public boolean isOpen() {
        return this.code.getName().equals("OPEN");
    }

    public boolean isCreatedBy(User user) {
        return Objects.equals(this.creator.getId(), user.getId());
    }
}
