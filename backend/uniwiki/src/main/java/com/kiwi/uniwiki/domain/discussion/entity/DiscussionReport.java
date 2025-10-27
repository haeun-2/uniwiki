package com.kiwi.uniwiki.domain.discussion.entity;

import com.kiwi.uniwiki.domain.code.entity.Code;
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
@Table(name = "discussion_reports")
@EntityListeners(AuditingEntityListener.class)
@IdClass(DiscussionReport.DiscussionReportId.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DiscussionReport {

    @Id
    @Column(name = "discussion_content_id")
    private Integer discussionContentId;

    @Id
    @Column(name = "reporter_id")
    private Integer reporterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_content_id", insertable = false, updatable = false)
    private DiscussionContent discussionContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", insertable = false, updatable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private User reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reason", nullable = false, length = 400)
    private String reason;

    @Column(name = "admin_reason", length = 200)
    private String adminReason;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_id", nullable = false)
    private Code code;

    @Getter
    @EqualsAndHashCode
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class DiscussionReportId implements Serializable {
        private Integer discussionContentId;
        private Integer reporterId;
    }
}