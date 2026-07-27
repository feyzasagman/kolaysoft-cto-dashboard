package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * WeeklyReport entity kalıcılık işlemleri.
 */
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {

    List<WeeklyReport> findByProjectIdOrderByYearDescWeekNumberDesc(Long projectId);

    Optional<WeeklyReport> findByProjectIdAndYearAndWeekNumber(Long projectId, Integer year, Integer weekNumber);

    boolean existsByProjectIdAndYearAndWeekNumber(Long projectId, Integer year, Integer weekNumber);
}
