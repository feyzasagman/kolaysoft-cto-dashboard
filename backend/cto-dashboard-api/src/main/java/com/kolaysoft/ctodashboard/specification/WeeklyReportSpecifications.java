package com.kolaysoft.ctodashboard.specification;

import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.util.PageableUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Haftalık rapor listeleme filtreleri.
 */
public final class WeeklyReportSpecifications {

    private WeeklyReportSpecifications() {
    }

    public static Specification<WeeklyReport> withFilters(
            String search,
            Long projectId,
            Long managerId,
            Integer year,
            Integer weekNumber
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Object, Object> project = root.join("project");

            if (projectId != null) {
                predicates.add(cb.equal(project.get("id"), projectId));
            }
            if (managerId != null) {
                predicates.add(cb.equal(project.get("manager").get("id"), managerId));
            }
            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            if (weekNumber != null) {
                predicates.add(cb.equal(root.get("weekNumber"), weekNumber));
            }
            String pattern = PageableUtils.normalizeSearch(search);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(project.get("code")), pattern),
                        cb.like(cb.lower(project.get("name")), pattern),
                        cb.like(cb.lower(root.get("overallNote")), pattern)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
