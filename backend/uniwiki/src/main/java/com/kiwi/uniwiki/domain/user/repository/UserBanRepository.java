package com.kiwi.uniwiki.domain.user.repository;

import com.kiwi.uniwiki.domain.user.entity.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Integer> {
}
