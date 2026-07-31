package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.RiskIssueMapper;
import com.kolaysoft.ctodashboard.repository.RiskIssueRepository;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.SecurityUtils;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.service.RiskIssueService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Risk CRUD iş kuralları.
 */
@Service
public class RiskIssueServiceImpl implements RiskIssueService {

    private final RiskIssueRepository riskIssueRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final ProjectAccessService projectAccessService;

    public RiskIssueServiceImpl(
            RiskIssueRepository riskIssueRepository,
            WeeklyReportRepository weeklyReportRepository,
            ProjectAccessService projectAccessService
    ) {
        this.riskIssueRepository = riskIssueRepository;
        this.weeklyReportRepository = weeklyReportRepository;
        this.projectAccessService = projectAccessService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskIssueResponse> getAllRisks() {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        List<RiskIssue> risks = projectAccessService.canReadAllReports(currentUser)
                ? riskIssueRepository.findAllWithReport()
                : riskIssueRepository.findByManagerIdWithReport(currentUser.getId());

        return risks.stream().map(RiskIssueMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public RiskIssueResponse createRisk(CreateRiskIssueRequest request) {
        WeeklyReport report = findReportOrThrow(request.reportId());
        projectAccessService.requireWritableProject(report.getProject().getId());

        RiskIssue riskIssue = new RiskIssue();
        riskIssue.setWeeklyReport(report);
        applyFields(riskIssue, request.title(), request.description(), request.riskLevel(),
                request.impact(), request.actionPlan(), request.status());

        RiskIssue saved = riskIssueRepository.save(riskIssue);
        return RiskIssueMapper.toResponse(findRiskOrThrow(saved.getId()));
    }

    @Override
    @Transactional
    public RiskIssueResponse updateRisk(Long id, UpdateRiskIssueRequest request) {
        RiskIssue riskIssue = findRiskOrThrow(id);
        projectAccessService.requireWritableProject(riskIssue.getWeeklyReport().getProject().getId());

        applyFields(riskIssue, request.title(), request.description(), request.riskLevel(),
                request.impact(), request.actionPlan(), request.status());

        riskIssueRepository.save(riskIssue);
        return RiskIssueMapper.toResponse(findRiskOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteRisk(Long id) {
        RiskIssue riskIssue = findRiskOrThrow(id);
        projectAccessService.requireWritableProject(riskIssue.getWeeklyReport().getProject().getId());
        riskIssueRepository.delete(riskIssue);
    }

    private void applyFields(
            RiskIssue riskIssue,
            String title,
            String description,
            RiskLevel riskLevel,
            String impact,
            String actionPlan,
            RiskStatus status
    ) {
        riskIssue.setTitle(title.trim());
        riskIssue.setDescription(description);
        riskIssue.setRiskLevel(riskLevel);
        riskIssue.setImpact(impact);
        riskIssue.setActionPlan(actionPlan);
        riskIssue.setStatus(status);
    }

    private WeeklyReport findReportOrThrow(Long reportId) {
        return weeklyReportRepository.findByIdWithProject(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Haftalık rapor bulunamadı."));
    }

    private RiskIssue findRiskOrThrow(Long id) {
        return riskIssueRepository.findByIdWithReport(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk kaydı bulunamadı."));
    }
}
