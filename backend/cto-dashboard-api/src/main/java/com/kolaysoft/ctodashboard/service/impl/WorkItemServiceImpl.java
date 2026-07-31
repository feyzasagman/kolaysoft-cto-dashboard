package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.entity.WorkItem;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.WorkItemMapper;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.repository.WorkItemRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.SecurityUtils;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.service.WorkItemService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * İş kalemi CRUD iş kuralları.
 */
@Service
public class WorkItemServiceImpl implements WorkItemService {

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
    public List<WorkItemResponse> getAllWorkItems() {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        List<WorkItem> items = projectAccessService.canReadAllReports(currentUser)
                ? workItemRepository.findAllWithReport()
                : workItemRepository.findByManagerIdWithReport(currentUser.getId());

        return items.stream().map(WorkItemMapper::toResponse).toList();
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
            com.kolaysoft.ctodashboard.enums.WorkItemStatus status,
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
