package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * WeeklyReport entity kalıcılık işlemleri.
 */
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<WeeklyReport> {

    List<WeeklyReport> findByProjectIdOrderByYearDescWeekNumberDesc(Long projectId);

    Optional<WeeklyReport> findByProjectIdAndYearAndWeekNumber(Long projectId, Integer year, Integer weekNumber);

    boolean existsByProjectIdAndYearAndWeekNumber(Long projectId, Integer year, Integer weekNumber);

    boolean existsByProjectIdAndYearAndWeekNumberAndIdNot(
            Long projectId,
            Integer year,
            Integer weekNumber,
            Long id
    );

    boolean existsByProjectIdAndWeekNumber(Long projectId, Integer weekNumber);

    boolean existsByProjectIdAndWeekNumberAndIdNot(Long projectId, Integer weekNumber, Long id);

    long countByProjectId(Long projectId);

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.id = :id
            """)
    Optional<WeeklyReport> findByIdWithProject(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            ORDER BY wr.year DESC, wr.weekNumber DESC
            """)
    List<WeeklyReport> findAllWithProject();

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE p.id = :projectId
            ORDER BY wr.year DESC, wr.weekNumber DESC
            """)
    List<WeeklyReport> findByProjectIdWithProject(@Param("projectId") Long projectId);

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE p.manager.id = :managerId
            ORDER BY wr.year DESC, wr.weekNumber DESC
            """)
    List<WeeklyReport> findByManagerIdWithProject(@Param("managerId") Long managerId);

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.year = (
                SELECT MAX(w2.year) FROM WeeklyReport w2 WHERE w2.project = wr.project
            )
            AND wr.weekNumber = (
                SELECT MAX(w3.weekNumber) FROM WeeklyReport w3
                WHERE w3.project = wr.project AND w3.year = wr.year
            )
            """)
    List<WeeklyReport> findLatestReportPerProject();

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE p.id IN :projectIds
            AND wr.year = (
                SELECT MAX(w2.year) FROM WeeklyReport w2 WHERE w2.project = wr.project
            )
            AND wr.weekNumber = (
                SELECT MAX(w3.weekNumber) FROM WeeklyReport w3
                WHERE w3.project = wr.project AND w3.year = wr.year
            )
            """)
    List<WeeklyReport> findLatestReportsByProjectIds(@Param("projectIds") Collection<Long> projectIds);

    @Query("""
            SELECT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE wr.id IN :ids
            """)
    List<WeeklyReport> findByIdInWithProject(@Param("ids") Collection<Long> ids);

    @Query("""
            SELECT DISTINCT wr FROM WeeklyReport wr
            JOIN FETCH wr.project p
            LEFT JOIN FETCH p.manager
            WHERE (:projectId IS NULL OR p.id = :projectId)
              AND (:managerId IS NULL OR p.manager.id = :managerId)
              AND (:projectStatus IS NULL OR p.status = :projectStatus)
              AND (:year IS NULL OR wr.year = :year)
              AND (:weekNumber IS NULL OR wr.weekNumber = :weekNumber)
            ORDER BY wr.year DESC, wr.weekNumber DESC, wr.id DESC
            """)
    List<WeeklyReport> findFilteredReports(
            @Param("projectId") Long projectId,
            @Param("managerId") Long managerId,
            @Param("projectStatus") com.kolaysoft.ctodashboard.enums.ProjectStatus projectStatus,
            @Param("year") Integer year,
            @Param("weekNumber") Integer weekNumber,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(p) FROM Project p
            WHERE p.status = :activeStatus
              AND NOT EXISTS (
                  SELECT 1 FROM WeeklyReport wr
                  WHERE wr.project = p
                    AND wr.year = :year
                    AND wr.weekNumber = :weekNumber
              )
            """)
    long countActiveProjectsWithoutWeekReport(
            @Param("activeStatus") com.kolaysoft.ctodashboard.enums.ProjectStatus activeStatus,
            @Param("year") Integer year,
            @Param("weekNumber") Integer weekNumber
    );
}
