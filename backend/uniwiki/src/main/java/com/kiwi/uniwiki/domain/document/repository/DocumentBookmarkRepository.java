package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.DocumentBookmark;
import com.kiwi.uniwiki.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentBookmarkRepository extends JpaRepository<DocumentBookmark,DocumentBookmark.DocumentBookmarkId> {
    @Query("SELECT DISTINCT db FROM DocumentBookmark db " +
            "JOIN FETCH db.document d " +
            "JOIN FETCH d.university " +
            "WHERE db.userId = :userId")
    List<DocumentBookmark> findByUserId(Integer userId);
    boolean existsByUserIdAndDocumentId(Integer userId, Integer documentId);


}
