package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;

import java.util.List;

/**
 * İş kalemi iş kuralları.
 */
public interface WorkItemService {

    List<WorkItemResponse> getAllWorkItems();

    WorkItemResponse createWorkItem(CreateWorkItemRequest request);

    WorkItemResponse updateWorkItem(Long id, UpdateWorkItemRequest request);

    void deleteWorkItem(Long id);
}
