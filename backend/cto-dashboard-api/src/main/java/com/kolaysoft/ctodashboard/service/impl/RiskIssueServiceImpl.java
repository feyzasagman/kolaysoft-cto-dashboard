package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
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
import com.kolaysoft.ctodashboard.specification.RiskIssueSpecifications;
import com.kolaysoft.ctodashboard.util.PageableUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Risk CRUD iş kuralları.
 */
@Service
public class RiskIssueServiceImpl implements RiskIssueService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RiskIssueServiceImpl.class);
    private static final Set<String> ALLOWED_SORT = Set.of("id", "riskLevel", "status", "title");

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
    public PageResponse<RiskIssueResponse> getRisks(
            String search,
            Long reportId,
            RiskLevel riskLevel,
            RiskStatus status,
            int page,
            int size,
            String sort
    ) {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        Long managerScope = projectAccessService.canReadAllReports(currentUser) ? null : currentUser.getId();

        Pageable pageable = PageableUtils.toPageable(page, size, sort, ALLOWED_SORT, "id");
        Page<RiskIssue> riskPage = riskIssueRepository.findAll(
                RiskIssueSpecifications.withFilters(search, reportId, managerScope, riskLevel, status),
                pageable
        );

        List<Long> ids = riskPage.getContent().stream().map(RiskIssue::getId).toList();
        Map<Long, RiskIssue> withReport = ids.isEmpty()
                ? Map.of()
                : riskIssueRepository.findByIdInWithReport(ids).stream()
                .collect(Collectors.toMap(RiskIssue::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));

        List<RiskIssueResponse> content = ids.stream()
                .map(withReport::get)
                .map(RiskIssueMapper::toResponse)
                .toList();

        LOGGER.info("risks.list page={} size={} total={}", page, size, riskPage.getTotalElements());
        return PageResponse.of(content, page, size, riskPage.getTotalElements());
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
