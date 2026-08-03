package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;

/**
 * Risk iş kuralları.
 */
public interface RiskIssueService {

    PageResponse<RiskIssueResponse> getRisks(
            String search,
            Long reportId,
            RiskLevel riskLevel,
            RiskStatus status,
            int page,
            int size,
            String sort
    );

    RiskIssueResponse createRisk(CreateRiskIssueRequest request);

    RiskIssueResponse updateRisk(Long id, UpdateRiskIssueRequest request);

    void deleteRisk(Long id);
}
