package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDate;

/**
 * Dashboard proje listesi satırı.
 */
public record ProjectDashboardResponse(
        Long projectId,
        String code,
        String name,
        Long managerId,
        String managerName,
        String projectStatus,
        String latestHealth,
        Integer latestReportYear,
        Integer latestReportWeek,
        Integer progressTarget,
        Integer progressActual,
        long openRiskCount,
        long criticalRiskCount,
        long openBlockerCount,
        LocalDate latestReportDate,
        boolean hasCurrentWeekReport
) {
}
