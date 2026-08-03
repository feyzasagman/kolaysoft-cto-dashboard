package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.WeeklyReportMapper;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.SecurityUtils;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.service.WeeklyReportService;
import com.kolaysoft.ctodashboard.specification.WeeklyReportSpecifications;
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
 * Haftalık rapor CRUD iş kuralları.
 */
@Service
public class WeeklyReportServiceImpl implements WeeklyReportService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WeeklyReportServiceImpl.class);
    private static final Set<String> ALLOWED_SORT = Set.of("id", "year", "weekNumber", "reportDate");

    private final WeeklyReportRepository weeklyReportRepository;
    private final ProjectAccessService projectAccessService;

    public WeeklyReportServiceImpl(
            WeeklyReportRepository weeklyReportRepository,
            ProjectAccessService projectAccessService
    ) {
        this.weeklyReportRepository = weeklyReportRepository;
        this.projectAccessService = projectAccessService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WeeklyReportResponse> getReports(
            String search,
            Long projectId,
            Integer year,
            Integer weekNumber,
            int page,
            int size,
            String sort
    ) {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        Long managerScope = projectAccessService.canReadAllReports(currentUser) ? null : currentUser.getId();

        Pageable pageable = PageableUtils.toPageable(page, size, sort, ALLOWED_SORT, "year");
        Page<WeeklyReport> reportPage = weeklyReportRepository.findAll(
                WeeklyReportSpecifications.withFilters(search, projectId, managerScope, year, weekNumber),
                pageable
        );

        List<WeeklyReportResponse> content = mapWithProject(reportPage.getContent());
        LOGGER.info("reports.list page={} size={} total={}", page, size, reportPage.getTotalElements());
        return PageResponse.of(content, page, size, reportPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyReportResponse getReportById(Long id) {
        WeeklyReport report = findReportOrThrow(id);
        projectAccessService.requireReadableProject(report.getProject().getId());
        return WeeklyReportMapper.toResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WeeklyReportResponse> getReportsByProjectId(
            Long projectId,
            int page,
            int size,
            String sort
    ) {
        projectAccessService.requireReadableProject(projectId);
        return getReports(null, projectId, null, null, page, size, sort);
    }

    @Override
    @Transactional
    public WeeklyReportResponse createReport(CreateWeeklyReportRequest request) {
        Project project = projectAccessService.requireWritableProject(request.projectId());
        ensureUniqueWeek(project.getId(), request.weekNumber(), null);

        WeeklyReport report = new WeeklyReport();
        report.setProject(project);
        report.setYear(request.reportDate().getYear());
        report.setWeekNumber(request.weekNumber());
        applyFields(report, request.weekNumber(), request.reportDate(), request.plannedProgress(),
                request.actualProgress(), request.projectStatus(), request.scheduleStatus(),
                request.completedWork(), request.plannedWork(), request.overallNote());

        WeeklyReport saved = weeklyReportRepository.save(report);
        return WeeklyReportMapper.toResponse(findReportOrThrow(saved.getId()));
    }

    @Override
    @Transactional
    public WeeklyReportResponse updateReport(Long id, UpdateWeeklyReportRequest request) {
        WeeklyReport report = findReportOrThrow(id);
        projectAccessService.requireWritableProject(report.getProject().getId());
        ensureUniqueWeek(report.getProject().getId(), request.weekNumber(), id);

        report.setYear(request.reportDate().getYear());
        applyFields(report, request.weekNumber(), request.reportDate(), request.plannedProgress(),
                request.actualProgress(), request.projectStatus(), request.scheduleStatus(),
                request.completedWork(), request.plannedWork(), request.overallNote());

        weeklyReportRepository.save(report);
        return WeeklyReportMapper.toResponse(findReportOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteReport(Long id) {
        WeeklyReport report = findReportOrThrow(id);
        projectAccessService.requireWritableProject(report.getProject().getId());
        weeklyReportRepository.delete(report);
    }

    private List<WeeklyReportResponse> mapWithProject(List<WeeklyReport> reports) {
        if (reports.isEmpty()) {
            return List.of();
        }
        List<Long> ids = reports.stream().map(WeeklyReport::getId).toList();
        Map<Long, WeeklyReport> withProject = weeklyReportRepository.findByIdInWithProject(ids).stream()
                .collect(Collectors.toMap(WeeklyReport::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
        return ids.stream().map(withProject::get).map(WeeklyReportMapper::toResponse).toList();
    }

    private void ensureUniqueWeek(Long projectId, Integer weekNumber, Long currentReportId) {
        boolean exists = currentReportId == null
                ? weeklyReportRepository.existsByProjectIdAndWeekNumber(projectId, weekNumber)
                : weeklyReportRepository.existsByProjectIdAndWeekNumberAndIdNot(projectId, weekNumber, currentReportId);

        if (exists) {
            throw new ConflictException("Bu proje ve hafta için rapor zaten mevcut.");
        }
    }

    private void applyFields(
            WeeklyReport report,
            Integer weekNumber,
            java.time.LocalDate reportDate,
            Integer plannedProgress,
            Integer actualProgress,
            String projectStatus,
            String scheduleStatus,
            String completedWork,
            String plannedWork,
            String overallNote
    ) {
        report.setWeekNumber(weekNumber);
        report.setReportDate(reportDate);
        report.setPlannedProgress(plannedProgress);
        report.setActualProgress(actualProgress);
        report.setProjectStatus(projectStatus);
        report.setScheduleStatus(scheduleStatus);
        report.setCompletedWork(completedWork);
        report.setPlannedWork(plannedWork);
        report.setOverallNote(overallNote);
    }

    private WeeklyReport findReportOrThrow(Long id) {
        return weeklyReportRepository.findByIdWithProject(id)
                .orElseThrow(() -> new ResourceNotFoundException("Haftalık rapor bulunamadı."));
    }
}
