package com.kolaysoft.ctodashboard.specification;

import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import com.kolaysoft.ctodashboard.util.PageableUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * İş kalemi listeleme filtreleri.
 */
public final class WorkItemSpecifications {

    private WorkItemSpecifications() {
    }

    public static Specification<WorkItem> withFilters(
            String search,
            Long reportId,
            Long managerId,
            WorkItemStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Object, Object> report = root.join("weeklyReport");
            Join<Object, Object> project = report.join("project");

            if (reportId != null) {
                predicates.add(cb.equal(report.get("id"), reportId));
            }
            if (managerId != null) {
                predicates.add(cb.equal(project.get("manager").get("id"), managerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            String pattern = PageableUtils.normalizeSearch(search);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("assignee")), pattern)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
