package com.kiwi.uniwiki.domain.university.entity;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "regions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "region_id")
    private Short id;

    @Column(name = "name", nullable = false, unique = true, length = 20)
    private String name;
}
