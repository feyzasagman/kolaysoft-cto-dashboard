package com.kolaysoft.ctodashboard.dto.response;

/**
 * CTO dashboard özet metrikleri.
 */
public record DashboardSummaryResponse(
        long totalProjects,
        long activeProjects,
        long completedProjects,
        long onHoldProjects,
        long cancelledProjects,
        long riskyProjects,
        long totalReports,
        long submittedReports,
        long draftReports,
        long openRisks,
        long criticalRisks,
        long openBlockers,
        long projectsWithoutCurrentWeekReport
) {
}
