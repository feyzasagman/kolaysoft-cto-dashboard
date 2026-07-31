package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDateTime;

/**
 * Dashboard kritik risk satırı.
 */
public record CriticalRiskResponse(
        Long riskId,
        Long projectId,
        String projectCode,
        String projectName,
        Long weeklyReportId,
        String title,
        String type,
        String impactLevel,
        String status,
        String mitigationPlan,
        LocalDateTime createdAt
) {
}
