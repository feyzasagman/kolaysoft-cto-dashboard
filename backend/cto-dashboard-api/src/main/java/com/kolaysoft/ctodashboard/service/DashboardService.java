package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.response.CriticalRiskResponse;
import com.kolaysoft.ctodashboard.dto.response.DashboardSummaryResponse;
import com.kolaysoft.ctodashboard.dto.response.HealthDistributionResponse;
import com.kolaysoft.ctodashboard.dto.response.LatestReportResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardDetailResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardResponse;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.enums.ReportHealth;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;

import java.util.List;

/**
 * CTO dashboard iş kuralları.
 */
public interface DashboardService {

    DashboardSummaryResponse getSummary();

    HealthDistributionResponse getHealthDistribution();

    List<CriticalRiskResponse> getCriticalRisks(
            RiskLevel level,
            RiskStatus status,
            Long projectId,
            int limit
    );

    List<LatestReportResponse> getLatestReports(
            Long projectId,
            Long managerId,
            ReportHealth health,
            ProjectStatus status,
            Integer year,
            Integer weekNumber,
            int limit
    );

    PageResponse<ProjectDashboardResponse> getProjects(
            String search,
            Long managerId,
            ProjectStatus projectStatus,
            ReportHealth health,
            RiskLevel riskLevel,
            Integer year,
            Integer weekNumber,
            Boolean hasCurrentWeekReport,
            int page,
            int size,
            String sort
    );

    ProjectDashboardDetailResponse getProjectDetail(Long projectId);
}
