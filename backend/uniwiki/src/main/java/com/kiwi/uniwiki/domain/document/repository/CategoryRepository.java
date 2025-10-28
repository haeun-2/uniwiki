package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.document.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Short> {
}
