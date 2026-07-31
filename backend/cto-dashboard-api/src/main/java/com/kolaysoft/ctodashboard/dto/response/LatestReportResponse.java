package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDateTime;

/**
 * Dashboard son haftalık rapor satırı.
 */
public record LatestReportResponse(
        Long reportId,
        Long projectId,
        String projectCode,
        String projectName,
        Long managerId,
        String managerName,
        Integer year,
        Integer weekNumber,
        String overallHealth,
        Integer progressTarget,
        Integer progressActual,
        String reportStatus,
        LocalDateTime submittedAt,
        LocalDateTime createdAt,
        long openRiskCount,
        long openBlockerCount
) {
}
