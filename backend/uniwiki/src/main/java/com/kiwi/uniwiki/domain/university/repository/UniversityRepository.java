package com.kiwi.uniwiki.domain.university.repository;

import com.kiwi.uniwiki.domain.university.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University, Short> {

    /**
     * 도메인으로 대학 찾기
     */
    Optional<University> findByEmailDomain(String emailDomain);

    /**
     * 특정 지역 대학 목록 조회
     */
    List<University> findAllByRegionId(Short regionId);

    @Query("""
            SELECT u
            FROM University u
            JOIN FETCH u.region
            WHERE u.id = :id
           """)
    Optional<University> findByIdWithRegion(@Param("id") Short id);
}
