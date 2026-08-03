package com.kolaysoft.ctodashboard.specification;

import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.util.PageableUtils;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Kullanıcı listeleme filtreleri.
 */
public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> withFilters(String search, RoleType role, Boolean active) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            List<Predicate> predicates = new ArrayList<>();
            root.join("role", JoinType.LEFT);

            String pattern = PageableUtils.normalizeSearch(search);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                ));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role").get("name"), role));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
