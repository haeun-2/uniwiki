package com.kiwi.uniwiki.domain.code.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "codes")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Code {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_group_id", nullable = false)
    private CodeGroup codeGroup;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code_number", nullable = false)
    private Integer codeNumber;

    @Column(name = "is_used")
    private Boolean isUsed;
}