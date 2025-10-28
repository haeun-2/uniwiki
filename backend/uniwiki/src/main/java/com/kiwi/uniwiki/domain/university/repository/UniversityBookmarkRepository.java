package com.kiwi.uniwiki.domain.university.repository;

import com.kiwi.uniwiki.domain.university.entity.UniversityBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UniversityBookmarkRepository extends JpaRepository<UniversityBookmark, UniversityBookmark.UniversityBookmarkId> {
}
