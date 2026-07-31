package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * RiskIssue entity kalıcılık işlemleri.
 */
public interface RiskIssueRepository extends JpaRepository<RiskIssue, Long> {

    List<RiskIssue> findByWeeklyReportId(Long weeklyReportId);

    List<RiskIssue> findByRiskLevel(RiskLevel riskLevel);

    List<RiskIssue> findByStatus(RiskStatus status);

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
}
