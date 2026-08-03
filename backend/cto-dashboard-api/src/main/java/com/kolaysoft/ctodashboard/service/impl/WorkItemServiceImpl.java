package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.WorkItemMapper;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.repository.WorkItemRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.SecurityUtils;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.service.WorkItemService;
import com.kolaysoft.ctodashboard.specification.WorkItemSpecifications;
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
 * İş kalemi CRUD iş kuralları.
 */
@Service
public class WorkItemServiceImpl implements WorkItemService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkItemServiceImpl.class);
    private static final Set<String> ALLOWED_SORT = Set.of("id", "status", "plannedDate", "title");

    private final WorkItemRepository workItemRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final ProjectAccessService projectAccessService;

    public WorkItemServiceImpl(
            WorkItemRepository workItemRepository,
            WeeklyReportRepository weeklyReportRepository,
            ProjectAccessService projectAccessService
    ) {
        this.workItemRepository = workItemRepository;
        this.weeklyReportRepository = weeklyReportRepository;
        this.projectAccessService = projectAccessService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkItemResponse> getWorkItems(
            String search,
            Long reportId,
            WorkItemStatus status,
            int page,
            int size,
            String sort
    ) {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        Long managerScope = projectAccessService.canReadAllReports(currentUser) ? null : currentUser.getId();

        Pageable pageable = PageableUtils.toPageable(page, size, sort, ALLOWED_SORT, "id");
        Page<WorkItem> itemPage = workItemRepository.findAll(
                WorkItemSpecifications.withFilters(search, reportId, managerScope, status),
                pageable
        );

        List<Long> ids = itemPage.getContent().stream().map(WorkItem::getId).toList();
        Map<Long, WorkItem> withReport = ids.isEmpty()
                ? Map.of()
                : workItemRepository.findByIdInWithReport(ids).stream()
                .collect(Collectors.toMap(WorkItem::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));

        List<WorkItemResponse> content = ids.stream()
                .map(withReport::get)
                .map(WorkItemMapper::toResponse)
                .toList();

        LOGGER.info("workItems.list page={} size={} total={}", page, size, itemPage.getTotalElements());
        return PageResponse.of(content, page, size, itemPage.getTotalElements());
    }

    @Override
    @Transactional
    public WorkItemResponse createWorkItem(CreateWorkItemRequest request) {
        WeeklyReport report = findReportOrThrow(request.reportId());
        projectAccessService.requireWritableProject(report.getProject().getId());

        WorkItem workItem = new WorkItem();
        workItem.setWeeklyReport(report);
        applyFields(workItem, request.title(), request.description(), request.assignee(),
                request.status(), request.plannedDate(), request.completedDate(), request.note());

        WorkItem saved = workItemRepository.save(workItem);
        return WorkItemMapper.toResponse(findWorkItemOrThrow(saved.getId()));
    }

    @Override
    @Transactional
    public WorkItemResponse updateWorkItem(Long id, UpdateWorkItemRequest request) {
        WorkItem workItem = findWorkItemOrThrow(id);
        projectAccessService.requireWritableProject(workItem.getWeeklyReport().getProject().getId());

        applyFields(workItem, request.title(), request.description(), request.assignee(),
                request.status(), request.plannedDate(), request.completedDate(), request.note());

        workItemRepository.save(workItem);
        return WorkItemMapper.toResponse(findWorkItemOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteWorkItem(Long id) {
        WorkItem workItem = findWorkItemOrThrow(id);
        projectAccessService.requireWritableProject(workItem.getWeeklyReport().getProject().getId());
        workItemRepository.delete(workItem);
    }

    private void applyFields(
            WorkItem workItem,
            String title,
            String description,
            String assignee,
            WorkItemStatus status,
            java.time.LocalDate plannedDate,
            java.time.LocalDate completedDate,
            String note
    ) {
        workItem.setTitle(title.trim());
        workItem.setDescription(description);
        workItem.setAssignee(assignee);
        workItem.setStatus(status);
        workItem.setPlannedDate(plannedDate);
        workItem.setCompletedDate(completedDate);
        workItem.setNote(note);
    }

    private WeeklyReport findReportOrThrow(Long reportId) {
        return weeklyReportRepository.findByIdWithProject(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Haftalık rapor bulunamadı."));
    }

    private WorkItem findWorkItemOrThrow(Long id) {
        return workItemRepository.findByIdWithReport(id)
                .orElseThrow(() -> new ResourceNotFoundException("İş kalemi bulunamadı."));
    }
}
