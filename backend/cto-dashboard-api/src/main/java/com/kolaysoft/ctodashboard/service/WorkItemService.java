package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;

/**
 * İş kalemi iş kuralları.
 */
public interface WorkItemService {

    PageResponse<WorkItemResponse> getWorkItems(
            String search,
            Long reportId,
            WorkItemStatus status,
            int page,
            int size,
            String sort
    );

    WorkItemResponse createWorkItem(CreateWorkItemRequest request);

    WorkItemResponse updateWorkItem(Long id, UpdateWorkItemRequest request);

    void deleteWorkItem(Long id);
}
