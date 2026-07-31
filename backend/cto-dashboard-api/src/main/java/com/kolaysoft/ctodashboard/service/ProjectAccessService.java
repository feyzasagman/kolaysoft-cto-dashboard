package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.repository.ProjectAssignmentRepository;
import com.kolaysoft.ctodashboard.repository.ProjectRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Proje sahipliği ve rol bazlı erişim kontrolleri.
 */
@Service
public class ProjectAccessService {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    public ProjectAccessService(
            ProjectRepository projectRepository,
            ProjectAssignmentRepository projectAssignmentRepository
    ) {
        this.projectRepository = projectRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public Project requireReadableProject(Long projectId) {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        Project project = findProjectOrThrow(projectId);

        if (SecurityUtils.isAdmin(currentUser) || SecurityUtils.isCto(currentUser)) {
            return project;
        }

        if (SecurityUtils.isProjectManager(currentUser) && isAssignedManager(project, currentUser.getId())) {
            return project;
        }

        throw new AccessDeniedException("Bu işlem için yetkiniz bulunmamaktadır.");
    }

    @Transactional(readOnly = true)
    public Project requireWritableProject(Long projectId) {
        CustomUserDetails currentUser = SecurityUtils.requireCurrentUser();
        Project project = findProjectOrThrow(projectId);

        if (SecurityUtils.isAdmin(currentUser)) {
            return project;
        }

        if (SecurityUtils.isProjectManager(currentUser) && isAssignedManager(project, currentUser.getId())) {
            return project;
        }

        throw new AccessDeniedException("Bu işlem için yetkiniz bulunmamaktadır.");
    }

    @Transactional(readOnly = true)
    public boolean canReadAllReports(CustomUserDetails currentUser) {
        return SecurityUtils.isAdmin(currentUser) || SecurityUtils.isCto(currentUser);
    }

    @Transactional(readOnly = true)
    public boolean isAssignedManager(Project project, Long userId) {
        if (project.getManager() != null && userId.equals(project.getManager().getId())) {
            return true;
        }
        return projectAssignmentRepository.existsByProjectIdAndUserId(project.getId(), userId);
    }

    private Project findProjectOrThrow(Long projectId) {
        return projectRepository.findByIdWithManager(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proje bulunamadı."));
    }
}
