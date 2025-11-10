package com.kiwi.uniwiki.domain.document.repository;

import com.kiwi.uniwiki.domain.admin.dto.DocumentSearchFilterDTO;
import com.kiwi.uniwiki.domain.admin.dto.response.AdminResponseDTO;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static com.kiwi.uniwiki.domain.document.entity.QCategory.category;
import static com.kiwi.uniwiki.domain.document.entity.QDocument.document;
import static com.kiwi.uniwiki.domain.document.entity.QDocumentVersion.documentVersion;
import static com.kiwi.uniwiki.domain.university.entity.QUniversity.university;
import static com.kiwi.uniwiki.domain.user.entity.QUser.user;

@Repository
@RequiredArgsConstructor
public class CustomDocumentRepositoryImpl implements CustomDocumentRepository {

    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public Page<AdminResponseDTO.DocumentSearchResult> searchDocuments(DocumentSearchFilterDTO filter, Pageable pageable) {

        List<AdminResponseDTO.DocumentSearchResult> content = jpaQueryFactory
                .select(Projections.constructor(AdminResponseDTO.DocumentSearchResult.class,
                        document.id,
                        documentVersion.createdAt,
                        university.name,
                        category.name,
                        document.title,
                        user.nickname,
                        documentVersion.plusCount,
                        documentVersion.minusCount
                ))
                .from(documentVersion)
                .join(documentVersion.document, document)
                .join(document.university, university)
                .join(documentVersion.category, category)
                .join(documentVersion.editor, user)
                .where(
                        categoryIdEq(filter.getCategoryId()),
                        universityIdEq(filter.getUniversityId()),
                        titleContains(filter.getTitle()),
                        nicknameContains(filter.getNickname()),
                        createdAtBetween(filter.getStartDate(), filter.getEndDate())
                        //, document.isDeleted.eq(false)
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(getCreatedAtOrder(pageable))
                .fetch();

        JPAQuery<Long> countQuery = jpaQueryFactory
                .select(documentVersion.count())
                .from(documentVersion)
                .join(documentVersion.document, document)
                .join(documentVersion.editor, user)
                .where(
                        categoryIdEq(filter.getCategoryId()),
                        universityIdEq(filter.getUniversityId()),
                        titleContains(filter.getTitle()),
                        nicknameContains(filter.getNickname()),
                        createdAtBetween(filter.getStartDate(), filter.getEndDate())
                        //, document.isDeleted.eq(false)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private OrderSpecifier<LocalDateTime> getCreatedAtOrder(Pageable pageable) {
        if (pageable.getSort().isEmpty()) {
            return documentVersion.createdAt.desc();
        }

        boolean isAsc = pageable.getSort().stream()
                .findFirst()
                .map(org.springframework.data.domain.Sort.Order::isAscending)
                .orElse(false);

        return isAsc ? documentVersion.createdAt.asc() : documentVersion.createdAt.desc();
    }

    private BooleanExpression categoryIdEq(Short categoryId) {
        return categoryId != null ? documentVersion.category.id.eq(categoryId) : null;
    }

    private BooleanExpression universityIdEq(Short universityId) {
        return universityId != null ? document.university.id.eq(universityId) : null;
    }

    private BooleanExpression titleContains(String title) {
        return (title != null && !title.isBlank()) ? document.title.containsIgnoreCase(title) : null;
    }

    private BooleanExpression nicknameContains(String nickname) {
        return (nickname != null && !nickname.isBlank()) ? user.nickname.containsIgnoreCase(nickname) : null;
    }

    private BooleanExpression createdAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return documentVersion.createdAt.between(startDate, endDate);
        } else if (startDate != null) {
            return documentVersion.createdAt.goe(startDate);
        } else if (endDate != null) {
            return documentVersion.createdAt.loe(endDate);
        }
        return null;
    }
}