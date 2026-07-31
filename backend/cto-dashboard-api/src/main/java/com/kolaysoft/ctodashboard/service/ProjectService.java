package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectManagerRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;

import java.util.List;

/**
 * Proje yönetim iş kuralları.
 */
public interface ProjectService {

    List<ProjectResponse> getAllProjects();

    ProjectResponse getProjectById(Long id);

    ProjectResponse createProject(CreateProjectRequest request);

    ProjectResponse updateProject(Long id, UpdateProjectRequest request);

    ProjectResponse updateProjectManager(Long id, UpdateProjectManagerRequest request);

    ProjectResponse updateProjectStatus(Long id, UpdateProjectStatusRequest request);

    void deleteProject(Long id);
}
