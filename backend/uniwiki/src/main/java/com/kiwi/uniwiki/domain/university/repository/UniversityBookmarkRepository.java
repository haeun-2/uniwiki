package com.kiwi.uniwiki.domain.university.repository;

import com.kiwi.uniwiki.domain.university.entity.UniversityBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversityBookmarkRepository extends JpaRepository<UniversityBookmark, UniversityBookmark.UniversityBookmarkId> {

    List<UniversityBookmark> findByUserId(Integer userId);
}
