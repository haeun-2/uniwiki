package com.kiwi.uniwiki.domain.university.repository;

import com.kiwi.uniwiki.domain.university.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University , Long> {

    /**
     * 도메인으로 대학 찾기
     */
    Optional<University> findByEmailDomain(String emailDomain);

    /**
     * 도메인 존재 여부 확인
     */
    boolean existsByEmailDomain(String emailDomain);
}
