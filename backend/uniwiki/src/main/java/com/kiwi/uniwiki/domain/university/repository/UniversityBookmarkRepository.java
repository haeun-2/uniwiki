package com.kiwi.uniwiki.domain.university.repository;

import com.kiwi.uniwiki.domain.university.entity.University;
import com.kiwi.uniwiki.domain.university.entity.UniversityBookmark;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversityBookmarkRepository extends JpaRepository<UniversityBookmark, UniversityBookmark.UniversityBookmarkId> {

    @Query("SELECT ub FROM UniversityBookmark ub " +
            "JOIN FETCH ub.university " +
            "WHERE ub.user.id = :userId")
    List<UniversityBookmark> findByUserId(@Param("userId") Integer userId);

    boolean existsByUserIdAndUniversityId(Integer userId, Short universityId);

    @Query("""
        SELECT u
        FROM UniversityBookmark ub
        JOIN ub.university u
        GROUP BY u
        ORDER BY COUNT(ub) DESC, MAX(ub.createdAt) DESC
        LIMIT 10
    """)
    List<University> findTop10UniversitiesByBookmarkCount();
}
