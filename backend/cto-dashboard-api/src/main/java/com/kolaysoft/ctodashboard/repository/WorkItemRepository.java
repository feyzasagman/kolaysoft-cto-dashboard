package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * WorkItem entity kalıcılık işlemleri.
 */
public interface WorkItemRepository extends JpaRepository<WorkItem, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<WorkItem> {

    List<WorkItem> findByWeeklyReportId(Long weeklyReportId);

    List<WorkItem> findByWeeklyReportIdAndStatus(Long weeklyReportId, WorkItemStatus status);

    long countByStatus(WorkItemStatus status);

    @Query("""
            SELECT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wi.id IN :ids
            """)
    List<WorkItem> findByIdInWithReport(@Param("ids") Collection<Long> ids);

    @Query("""
            SELECT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wi.id = :id
            """)
    Optional<WorkItem> findByIdWithReport(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            ORDER BY wi.id ASC
            """)
    List<WorkItem> findAllWithReport();

    @Query("""
            SELECT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.id = :reportId
            ORDER BY wi.id ASC
            """)
    List<WorkItem> findByReportIdWithReport(@Param("reportId") Long reportId);

    @Query("""
            SELECT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE p.manager.id = :managerId
            ORDER BY wi.id ASC
            """)
    List<WorkItem> findByManagerIdWithReport(@Param("managerId") Long managerId);

    @Query("""
            SELECT wi FROM WorkItem wi
            JOIN FETCH wi.weeklyReport wr
            WHERE wr.id IN :reportIds
            """)
    List<WorkItem> findByReportIds(@Param("reportIds") Collection<Long> reportIds);

    long countByWeeklyReportIdAndStatus(Long weeklyReportId, WorkItemStatus status);
}
