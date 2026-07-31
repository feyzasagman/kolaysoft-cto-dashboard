package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.response.CriticalRiskResponse;
import com.kolaysoft.ctodashboard.dto.response.DashboardSummaryResponse;
import com.kolaysoft.ctodashboard.dto.response.HealthDistributionResponse;
import com.kolaysoft.ctodashboard.dto.response.LatestReportResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardDetailResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardResponse;
import com.kolaysoft.ctodashboard.dto.response.ReportHistoryItemResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.enums.ReportHealth;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.repository.ProjectRepository;
import com.kolaysoft.ctodashboard.repository.RiskIssueRepository;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.repository.WorkItemRepository;
import com.kolaysoft.ctodashboard.service.DashboardService;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.util.IsoWeekUtils;
import com.kolaysoft.ctodashboard.util.ReportHealthCalculator;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * CTO dashboard iş kuralları.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Set<RiskStatus> OPEN_RISK_STATUSES = EnumSet.of(RiskStatus.OPEN, RiskStatus.IN_PROGRESS);
    private static final Set<RiskStatus> CLOSED_RISK_STATUSES = EnumSet.of(RiskStatus.RESOLVED, RiskStatus.ACCEPTED);
    private static final List<RiskLevel> DEFAULT_CRITICAL_LEVELS = List.of(RiskLevel.HIGH, RiskLevel.CRITICAL);
    private static final String REPORT_STATUS_SUBMITTED = "SUBMITTED";
    private static final String RISK_TYPE = "RISK";

    private final ProjectRepository projectRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final RiskIssueRepository riskIssueRepository;
    private final WorkItemRepository workItemRepository;
    private final ProjectAccessService projectAccessService;

    public DashboardServiceImpl(
            ProjectRepository projectRepository,
            WeeklyReportRepository weeklyReportRepository,
            RiskIssueRepository riskIssueRepository,
            WorkItemRepository workItemRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.weeklyReportRepository = weeklyReportRepository;
        this.riskIssueRepository = riskIssueRepository;
        this.workItemRepository = workItemRepository;
        this.projectAccessService = projectAccessService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus(ProjectStatus.ACTIVE);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long onHoldProjects = projectRepository.countByStatus(ProjectStatus.ON_HOLD);
        long cancelledProjects = projectRepository.countByStatus(ProjectStatus.CANCELLED);

        long totalReports = weeklyReportRepository.count();
        long openRisks = riskIssueRepository.countByStatusIn(OPEN_RISK_STATUSES);
        long criticalRisks = riskIssueRepository.countByRiskLevelAndStatusNotIn(
                RiskLevel.CRITICAL,
                CLOSED_RISK_STATUSES
        );
        long openBlockers = workItemRepository.countByStatus(WorkItemStatus.BLOCKED);
        long projectsWithoutCurrentWeekReport = weeklyReportRepository.countActiveProjectsWithoutWeekReport(
                ProjectStatus.ACTIVE,
                IsoWeekUtils.currentWeekBasedYear(),
                IsoWeekUtils.currentWeekNumber()
        );

        long riskyProjects = countRiskyActiveProjects();

        return new DashboardSummaryResponse(
                totalProjects,
                activeProjects,
                completedProjects,
                onHoldProjects,
                cancelledProjects,
                riskyProjects,
                totalReports,
                totalReports,
                0L,
                openRisks,
                criticalRisks,
                openBlockers,
                projectsWithoutCurrentWeekReport
        );
    }

    @Override
    @Transactional(readOnly = true)
    public HealthDistributionResponse getHealthDistribution() {
        List<Project> activeProjects = projectRepository.findByStatusWithManager(ProjectStatus.ACTIVE);
        Map<Long, WeeklyReport> latestByProject = indexLatestReports(
                weeklyReportRepository.findLatestReportsByProjectIds(
                        activeProjects.stream().map(Project::getId).toList()
                )
        );
        Map<Long, List<RiskIssue>> risksByReport = loadRisksByReportIds(latestByProject.values());

        long green = 0;
        long yellow = 0;
        long red = 0;
        long noReport = 0;

        for (Project project : activeProjects) {
            WeeklyReport latest = latestByProject.get(project.getId());
            if (latest == null) {
                noReport++;
                continue;
            }
            ReportHealth health = ReportHealthCalculator.calculate(
                    latest,
                    risksByReport.getOrDefault(latest.getId(), List.of())
            );
            switch (health) {
                case RED -> red++;
                case YELLOW -> yellow++;
                case GREEN -> green++;
            }
        }

        return new HealthDistributionResponse(green, yellow, red, noReport);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriticalRiskResponse> getCriticalRisks(
            RiskLevel level,
            RiskStatus status,
            Long projectId,
            int limit
    ) {
        List<RiskLevel> levels = level == null ? DEFAULT_CRITICAL_LEVELS : List.of(level);
        List<RiskStatus> statuses = status == null ? List.copyOf(OPEN_RISK_STATUSES) : List.of(status);

        return riskIssueRepository.findCriticalRisks(
                        projectId,
                        levels,
                        statuses,
                        PageRequest.of(0, limit)
                ).stream()
                .map(this::toCriticalRiskResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LatestReportResponse> getLatestReports(
            Long projectId,
            Long managerId,
            ReportHealth health,
            ProjectStatus status,
            Integer year,
            Integer weekNumber,
            int limit
    ) {
        List<WeeklyReport> reports = weeklyReportRepository.findFilteredReports(
                projectId,
                managerId,
                year,
                weekNumber,
                PageRequest.of(0, Math.max(limit * 3, limit), Sort.by(Sort.Direction.DESC, "year", "weekNumber", "id"))
        );

        Map<Long, List<RiskIssue>> risksByReport = loadRisksByReportIds(reports);
        Map<Long, List<WorkItem>> workItemsByReport = loadWorkItemsByReportIds(reports);

        return reports.stream()
                .filter(report -> status == null || report.getProject().getStatus() == status)
                .map(report -> toLatestReportResponse(
                        report,
                        risksByReport.getOrDefault(report.getId(), List.of()),
                        workItemsByReport.getOrDefault(report.getId(), List.of())
                ))
                .filter(response -> health == null
                        || (response.overallHealth() != null
                        && response.overallHealth().equals(health.name())))
                .limit(limit)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProjectDashboardResponse> getProjects(
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
    ) {
        boolean needsInMemoryFilter = health != null
                || riskLevel != null
                || year != null
                || weekNumber != null
                || hasCurrentWeekReport != null;

        Specification<Project> specification = buildProjectSpecification(search, managerId, projectStatus);
        Sort springSort = parseSort(sort);

        if (!needsInMemoryFilter) {
            Page<Project> projectPage = projectRepository.findAll(
                    specification,
                    PageRequest.of(page, size, springSort)
            );
            List<ProjectDashboardResponse> content = enrichProjects(projectPage.getContent());
            return PageResponse.of(content, page, size, projectPage.getTotalElements());
        }

        List<Project> allProjects = projectRepository.findAll(specification, springSort);
        List<ProjectDashboardResponse> enriched = enrichProjects(allProjects).stream()
                .filter(item -> matchesAdvancedFilters(item, health, riskLevel, year, weekNumber, hasCurrentWeekReport))
                .toList();

        int from = Math.min(page * size, enriched.size());
        int to = Math.min(from + size, enriched.size());
        return PageResponse.of(enriched.subList(from, to), page, size, enriched.size());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDashboardDetailResponse getProjectDetail(Long projectId) {
        Project project = projectAccessService.requireReadableProject(projectId);
        List<WeeklyReport> history = weeklyReportRepository.findByProjectIdWithProject(projectId);
        WeeklyReport latest = history.isEmpty() ? null : history.getFirst();

        Map<Long, List<RiskIssue>> risksByReport = loadRisksByReportIds(history);
        Map<Long, List<WorkItem>> workItemsByReport = loadWorkItemsByReportIds(history);

        LatestReportResponse latestReportResponse = null;
        String latestHealth = null;
        Integer progressTarget = null;
        Integer progressActual = null;
        long openRisks = 0;
        long openBlockers = 0;

        if (latest != null) {
            List<RiskIssue> latestRisks = risksByReport.getOrDefault(latest.getId(), List.of());
            List<WorkItem> latestWorkItems = workItemsByReport.getOrDefault(latest.getId(), List.of());
            latestReportResponse = toLatestReportResponse(latest, latestRisks, latestWorkItems);
            latestHealth = latestReportResponse.overallHealth();
            progressTarget = latest.getPlannedProgress();
            progressActual = latest.getActualProgress();
            openRisks = countOpenRisks(latestRisks);
            openBlockers = countOpenBlockers(latestWorkItems);
        }

        List<ReportHistoryItemResponse> lastFive = history.stream()
                .limit(5)
                .map(report -> {
                    ReportHealth calculated = ReportHealthCalculator.calculate(
                            report,
                            risksByReport.getOrDefault(report.getId(), List.of())
                    );
                    return new ReportHistoryItemResponse(
                            report.getYear(),
                            report.getWeekNumber(),
                            calculated == null ? null : calculated.name(),
                            report.getPlannedProgress(),
                            report.getActualProgress(),
                            toDateTime(report)
                    );
                })
                .toList();

        User manager = project.getManager();
        return new ProjectDashboardDetailResponse(
                project.getId(),
                project.getCode(),
                project.getName(),
                project.getDescription(),
                project.getStatus().name(),
                project.getStartDate(),
                project.getEndDate(),
                manager == null ? null : manager.getId(),
                manager == null ? null : manager.getFullName(),
                manager == null ? null : manager.getEmail(),
                latestReportResponse,
                latestHealth,
                progressTarget,
                progressActual,
                openRisks,
                openBlockers,
                history.size(),
                lastFive
        );
    }

    private long countRiskyActiveProjects() {
        List<Project> activeProjects = projectRepository.findByStatus(ProjectStatus.ACTIVE);
        if (activeProjects.isEmpty()) {
            return 0;
        }
        Map<Long, WeeklyReport> latestByProject = indexLatestReports(
                weeklyReportRepository.findLatestReportsByProjectIds(
                        activeProjects.stream().map(Project::getId).toList()
                )
        );
        Map<Long, List<RiskIssue>> risksByReport = loadRisksByReportIds(latestByProject.values());

        return activeProjects.stream()
                .map(project -> latestByProject.get(project.getId()))
                .filter(Objects::nonNull)
                .map(report -> ReportHealthCalculator.calculate(
                        report,
                        risksByReport.getOrDefault(report.getId(), List.of())
                ))
                .filter(health -> health == ReportHealth.YELLOW || health == ReportHealth.RED)
                .count();
    }

    private List<ProjectDashboardResponse> enrichProjects(List<Project> projects) {
        if (projects.isEmpty()) {
            return List.of();
        }

        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        Map<Long, Project> projectsWithManager = projectRepository.findByIdInWithManager(projectIds).stream()
                .collect(Collectors.toMap(
                        Project::getId,
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
        List<Project> orderedProjects = projectIds.stream()
                .map(projectsWithManager::get)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, WeeklyReport> latestByProject = indexLatestReports(
                weeklyReportRepository.findLatestReportsByProjectIds(projectIds)
        );
        Map<Long, List<RiskIssue>> risksByReport = loadRisksByReportIds(latestByProject.values());
        Map<Long, List<WorkItem>> workItemsByReport = loadWorkItemsByReportIds(latestByProject.values());

        int currentYear = IsoWeekUtils.currentWeekBasedYear();
        int currentWeek = IsoWeekUtils.currentWeekNumber();

        return orderedProjects.stream()
                .map(project -> {
                    WeeklyReport latest = latestByProject.get(project.getId());
                    User manager = project.getManager();
                    if (latest == null) {
                        return new ProjectDashboardResponse(
                                project.getId(),
                                project.getCode(),
                                project.getName(),
                                manager == null ? null : manager.getId(),
                                manager == null ? null : manager.getFullName(),
                                project.getStatus().name(),
                                null,
                                null,
                                null,
                                null,
                                null,
                                0,
                                0,
                                0,
                                null,
                                false
                        );
                    }

                    List<RiskIssue> risks = risksByReport.getOrDefault(latest.getId(), List.of());
                    List<WorkItem> workItems = workItemsByReport.getOrDefault(latest.getId(), List.of());
                    ReportHealth health = ReportHealthCalculator.calculate(latest, risks);
                    boolean hasCurrent = Objects.equals(latest.getYear(), currentYear)
                            && Objects.equals(latest.getWeekNumber(), currentWeek);

                    return new ProjectDashboardResponse(
                            project.getId(),
                            project.getCode(),
                            project.getName(),
                            manager == null ? null : manager.getId(),
                            manager == null ? null : manager.getFullName(),
                            project.getStatus().name(),
                            health == null ? null : health.name(),
                            latest.getYear(),
                            latest.getWeekNumber(),
                            latest.getPlannedProgress(),
                            latest.getActualProgress(),
                            countOpenRisks(risks),
                            countCriticalRisks(risks),
                            countOpenBlockers(workItems),
                            latest.getReportDate(),
                            hasCurrent
                    );
                })
                .toList();
    }

    private boolean matchesAdvancedFilters(
            ProjectDashboardResponse item,
            ReportHealth health,
            RiskLevel riskLevel,
            Integer year,
            Integer weekNumber,
            Boolean hasCurrentWeekReport
    ) {
        if (health != null && (item.latestHealth() == null || !item.latestHealth().equals(health.name()))) {
            return false;
        }
        if (year != null && !Objects.equals(item.latestReportYear(), year)) {
            return false;
        }
        if (weekNumber != null && !Objects.equals(item.latestReportWeek(), weekNumber)) {
            return false;
        }
        if (hasCurrentWeekReport != null && item.hasCurrentWeekReport() != hasCurrentWeekReport) {
            return false;
        }
        if (riskLevel == RiskLevel.CRITICAL && item.criticalRiskCount() <= 0) {
            return false;
        }
        if (riskLevel != null && riskLevel != RiskLevel.CRITICAL && item.openRiskCount() <= 0) {
            return false;
        }
        return true;
    }

    private Specification<Project> buildProjectSpecification(
            String search,
            Long managerId,
            ProjectStatus projectStatus
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            if (managerId != null) {
                predicates.add(cb.equal(root.get("manager").get("id"), managerId));
            }
            if (projectStatus != null) {
                predicates.add(cb.equal(root.get("status"), projectStatus));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Set<String> allowed = Set.of("name", "code", "status", "createdAt", "id");
        if (!allowed.contains(property)) {
            throw new BusinessRuleException("Geçersiz sıralama alanı: " + property);
        }
        Sort.Direction direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }

    private Map<Long, WeeklyReport> indexLatestReports(List<WeeklyReport> reports) {
        return reports.stream().collect(Collectors.toMap(
                report -> report.getProject().getId(),
                Function.identity(),
                (left, right) -> left
        ));
    }

    private Map<Long, List<RiskIssue>> loadRisksByReportIds(Iterable<WeeklyReport> reports) {
        List<Long> reportIds = new ArrayList<>();
        reports.forEach(report -> reportIds.add(report.getId()));
        if (reportIds.isEmpty()) {
            return Map.of();
        }
        return riskIssueRepository.findByReportIdsWithReport(reportIds).stream()
                .collect(Collectors.groupingBy(risk -> risk.getWeeklyReport().getId()));
    }

    private Map<Long, List<WorkItem>> loadWorkItemsByReportIds(Iterable<WeeklyReport> reports) {
        List<Long> reportIds = new ArrayList<>();
        reports.forEach(report -> reportIds.add(report.getId()));
        if (reportIds.isEmpty()) {
            return Map.of();
        }
        return workItemRepository.findByReportIds(reportIds).stream()
                .collect(Collectors.groupingBy(item -> item.getWeeklyReport().getId()));
    }

    private CriticalRiskResponse toCriticalRiskResponse(RiskIssue risk) {
        Project project = risk.getWeeklyReport().getProject();
        return new CriticalRiskResponse(
                risk.getId(),
                project.getId(),
                project.getCode(),
                project.getName(),
                risk.getWeeklyReport().getId(),
                risk.getTitle(),
                RISK_TYPE,
                risk.getRiskLevel().name(),
                risk.getStatus().name(),
                risk.getActionPlan(),
                toDateTime(risk.getWeeklyReport())
        );
    }

    private LatestReportResponse toLatestReportResponse(
            WeeklyReport report,
            List<RiskIssue> risks,
            List<WorkItem> workItems
    ) {
        Project project = report.getProject();
        User manager = project.getManager();
        ReportHealth health = ReportHealthCalculator.calculate(report, risks);
        LocalDateTime submittedAt = toDateTime(report);

        return new LatestReportResponse(
                report.getId(),
                project.getId(),
                project.getCode(),
                project.getName(),
                manager == null ? null : manager.getId(),
                manager == null ? null : manager.getFullName(),
                report.getYear(),
                report.getWeekNumber(),
                health == null ? null : health.name(),
                report.getPlannedProgress(),
                report.getActualProgress(),
                REPORT_STATUS_SUBMITTED,
                submittedAt,
                submittedAt,
                countOpenRisks(risks),
                countOpenBlockers(workItems)
        );
    }

    private long countOpenRisks(List<RiskIssue> risks) {
        return risks.stream().filter(risk -> OPEN_RISK_STATUSES.contains(risk.getStatus())).count();
    }

    private long countCriticalRisks(List<RiskIssue> risks) {
        return risks.stream()
                .filter(risk -> risk.getRiskLevel() == RiskLevel.CRITICAL)
                .filter(risk -> !CLOSED_RISK_STATUSES.contains(risk.getStatus()))
                .count();
    }

    private long countOpenBlockers(List<WorkItem> workItems) {
        return workItems.stream().filter(item -> item.getStatus() == WorkItemStatus.BLOCKED).count();
    }

    private LocalDateTime toDateTime(WeeklyReport report) {
        return report.getReportDate() == null ? null : report.getReportDate().atStartOfDay();
    }
}
