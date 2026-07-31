package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;

import java.util.List;

/**
 * Risk iş kuralları.
 */
public interface RiskIssueService {

    List<RiskIssueResponse> getAllRisks();

    RiskIssueResponse createRisk(CreateRiskIssueRequest request);

    RiskIssueResponse updateRisk(Long id, UpdateRiskIssueRequest request);

    void deleteRisk(Long id);
}
