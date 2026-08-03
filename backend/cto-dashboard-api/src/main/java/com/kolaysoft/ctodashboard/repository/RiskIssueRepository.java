package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * RiskIssue entity kalıcılık işlemleri.
 */
public interface RiskIssueRepository extends JpaRepository<RiskIssue, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<RiskIssue> {

    List<RiskIssue> findByWeeklyReportId(Long weeklyReportId);

    List<RiskIssue> findByRiskLevel(RiskLevel riskLevel);

    List<RiskIssue> findByStatus(RiskStatus status);

    long countByStatusIn(Collection<RiskStatus> statuses);

    long countByRiskLevelAndStatusNotIn(RiskLevel riskLevel, Collection<RiskStatus> statuses);

    @Query("""
            SELECT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE ri.id IN :ids
            """)
    List<RiskIssue> findByIdInWithReport(@Param("ids") Collection<Long> ids);

    @Query("""
            SELECT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE ri.id = :id
            """)
    Optional<RiskIssue> findByIdWithReport(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            ORDER BY ri.id ASC
            """)
    List<RiskIssue> findAllWithReport();

    @Query("""
            SELECT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.id = :reportId
            ORDER BY ri.id ASC
            """)
    List<RiskIssue> findByReportIdWithReport(@Param("reportId") Long reportId);

    @Query("""
            SELECT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE p.manager.id = :managerId
            ORDER BY ri.id ASC
            """)
    List<RiskIssue> findByManagerIdWithReport(@Param("managerId") Long managerId);

    @Query("""
            SELECT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.id IN :reportIds
            """)
    List<RiskIssue> findByReportIdsWithReport(@Param("reportIds") Collection<Long> reportIds);

    @Query("""
            SELECT DISTINCT ri FROM RiskIssue ri
            JOIN FETCH ri.weeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE (:projectId IS NULL OR p.id = :projectId)
              AND ri.riskLevel IN :levels
              AND ri.status IN :statuses
            ORDER BY ri.riskLevel DESC, ri.id DESC
            """)
    List<RiskIssue> findCriticalRisks(
            @Param("projectId") Long projectId,
            @Param("levels") Collection<RiskLevel> levels,
            @Param("statuses") Collection<RiskStatus> statuses,
            Pageable pageable
    );
}
