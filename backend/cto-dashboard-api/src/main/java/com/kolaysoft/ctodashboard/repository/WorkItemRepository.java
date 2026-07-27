package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * WorkItem entity kalıcılık işlemleri.
 */
public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {

    List<WorkItem> findByWeeklyReportId(Long weeklyReportId);

    List<WorkItem> findByWeeklyReportIdAndStatus(Long weeklyReportId, WorkItemStatus status);
}
