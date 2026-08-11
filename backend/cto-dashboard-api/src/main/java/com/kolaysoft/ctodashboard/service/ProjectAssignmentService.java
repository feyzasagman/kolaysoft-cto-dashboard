package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectAssignmentRequest;
import com.kolaysoft.ctodashboard.dto.response.ProjectAssignmentResponse;

import java.util.List;

/**
 * Proje atama işlemleri.
 */
public interface ProjectAssignmentService {

    List<ProjectAssignmentResponse> listAssignments(Long projectId);

    ProjectAssignmentResponse assignUser(Long projectId, CreateProjectAssignmentRequest request);

    void removeAssignment(Long projectId, Long userId);
}
