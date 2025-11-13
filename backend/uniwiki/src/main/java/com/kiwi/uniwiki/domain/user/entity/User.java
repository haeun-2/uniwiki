package com.kiwi.uniwiki.domain.user.entity;

import com.kiwi.uniwiki.domain.university.entity.University;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 320, message = "이메일은 320자를 초과할 수 없습니다")
    @Column(name = "email", nullable = false, unique = true, length = 320)
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(max = 64, message = "비밀번호는 64자를 초과할 수 없습니다")
    @Column(name = "password", nullable = false, length = 64)
    private String password;

    @NotBlank(message = "닉네임은 필수입니다")
    @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하여야 합니다")
    @Column(name = "nickname", nullable = false, unique = true, length = 20)
    private String nickname;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "is_university_verified", nullable = false)
    private Boolean isUniversityVerified;

    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name ="is_push_agree")
    private Boolean isPushAgree;

    public enum Role {
        USER,
        ADMIN
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public void changeIsPushAgree(Boolean isPushAgree){
        this.isPushAgree = isPushAgree;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }
}