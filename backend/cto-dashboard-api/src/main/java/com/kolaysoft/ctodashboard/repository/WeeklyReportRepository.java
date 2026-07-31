package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * WeeklyReport entity kalıcılık işlemleri.
 */
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {

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
}
