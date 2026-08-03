package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectManagerRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;

/**
 * Proje yönetim iş kuralları.
 */
public interface ProjectService {

    PageResponse<ProjectResponse> getProjects(
            String search,
            ProjectStatus status,
            Long managerId,
            int page,
            int size,
            String sort
    );

    ProjectResponse getProjectById(Long id);

    ProjectResponse createProject(CreateProjectRequest request);

    ProjectResponse updateProject(Long id, UpdateProjectRequest request);

    ProjectResponse updateProjectManager(Long id, UpdateProjectManagerRequest request);

    ProjectResponse updateProjectStatus(Long id, UpdateProjectStatusRequest request);

    void deleteProject(Long id);
}
