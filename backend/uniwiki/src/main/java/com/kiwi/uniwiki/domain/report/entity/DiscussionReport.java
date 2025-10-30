package com.kiwi.uniwiki.domain.report.entity;

import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.discussion.entity.DiscussionContent;
import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "discussion_reports")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DiscussionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discussion_report_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_content_id", nullable = false)
    private DiscussionContent discussionContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private User reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
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

    @Builder
    public DiscussionReport(DiscussionContent discussionContent, User reporter, User reportedUser, String reason, Code code) {
        this.discussionContent = discussionContent;
        this.reporter = reporter;
        this.reportedUser = reportedUser;
        this.reason = reason;
        this.code = code;
    }

}