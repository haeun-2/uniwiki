package com.kiwi.uniwiki.domain.user.repository;

import com.kiwi.uniwiki.domain.user.entity.UserBan;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Integer> {

    //현재 활성화된 (차단 중인) UserBan 이 있는지 확인
    //bannedUntil이 현재 시간보다 미래인 차단 기록이 있는지 체크
    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END " +
            "FROM UserBan ub " +
            "WHERE ub.user.id = :userId " +
            "AND ub.bannedUntil > :now")
    boolean existsActiveBanByUserId(@Param("userId") Integer userId, @Param("now") LocalDateTime now);

    @Query("SELECT ub FROM UserBan ub " +
            "WHERE ub.user.id = :userId " +
            "AND ub.bannedUntil > :now " +
            "ORDER BY ub.bannedUntil DESC " +
            "LIMIT 1")
    Optional<UserBan> findActiveBanByUserId(@Param("userId") Integer userId, @Param("now") LocalDateTime now);

}
