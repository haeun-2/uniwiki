package com.kiwi.uniwiki.domain.university.entity;

import com.kiwi.uniwiki.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "university_bookmarks")
@IdClass(UniversityBookmark.UniversityBookmarkId.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UniversityBookmark {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Id
    @Column(name = "university_id")
    private Short universityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", insertable = false, updatable = false)
    private University university;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Getter
    @EqualsAndHashCode
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class UniversityBookmarkId implements Serializable {
        private Integer userId;
        private Short universityId;
    }
}