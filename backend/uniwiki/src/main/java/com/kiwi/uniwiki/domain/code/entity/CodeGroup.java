package com.kiwi.uniwiki.domain.code.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "code_groups")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_group_id")
    private Short id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "is_used")
    private Boolean isUsed;
}