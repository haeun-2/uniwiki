package com.kiwi.uniwiki.domain.university.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "universities")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "university_id")
    private Short id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "phone", length = 13)
    private String phone;

    @Column(name = "website")
    private String website;

    @Column(name = "email_domain", nullable = false)
    private String emailDomain;

    @Column(name = "logo_url", length = 300)
    private String logoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;
}
