package com.kolaysoft.ctodashboard.dto.response;

/**
 * Risk cevap DTO'su.
 */
public record RiskIssueResponse(
        Long id,
        Long reportId,
        String title,
        String description,
        String riskLevel,
        String impact,
        String actionPlan,
        String status
) {
}
