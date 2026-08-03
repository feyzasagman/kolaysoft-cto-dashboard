package com.kolaysoft.ctodashboard.specification;

import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.util.PageableUtils;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Proje listeleme filtreleri.
 */
public final class ProjectSpecifications {

    private ProjectSpecifications() {
    }

    public static Specification<Project> withFilters(String search, ProjectStatus status, Long managerId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            String pattern = PageableUtils.normalizeSearch(search);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (managerId != null) {
                predicates.add(cb.equal(root.get("manager").get("id"), managerId));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
