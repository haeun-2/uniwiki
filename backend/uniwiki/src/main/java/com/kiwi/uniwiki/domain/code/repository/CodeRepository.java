package com.kiwi.uniwiki.domain.code.repository;

import com.kiwi.uniwiki.domain.code.entity.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CodeRepository extends JpaRepository<Code, Short> {

    @Query("SELECT c FROM Code c JOIN FETCH c.codeGroup")
    List<Code> findAllWithCodeGroup();

}
