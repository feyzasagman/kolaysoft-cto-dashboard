package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.entity.RiskIssue;

/**
 * RiskIssue entity ↔ DTO dönüşümleri.
 */
public final class RiskIssueMapper {

    private RiskIssueMapper() {
    }

    public static RiskIssueResponse toResponse(RiskIssue riskIssue) {
        return new RiskIssueResponse(
                riskIssue.getId(),
                riskIssue.getWeeklyReport().getId(),
                riskIssue.getTitle(),
                riskIssue.getDescription(),
                riskIssue.getRiskLevel().name(),
                riskIssue.getImpact(),
                riskIssue.getActionPlan(),
                riskIssue.getStatus().name()
        );
    }
}
