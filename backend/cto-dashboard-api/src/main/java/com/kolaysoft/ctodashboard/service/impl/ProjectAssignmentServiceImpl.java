package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectAssignmentRequest;
import com.kolaysoft.ctodashboard.dto.response.ProjectAssignmentResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.ProjectAssignment;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.ProjectAssignmentMapper;
import com.kolaysoft.ctodashboard.repository.ProjectAssignmentRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import com.kolaysoft.ctodashboard.service.ProjectAssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Project.managerId ana PM'i temsil eder; ProjectAssignment ek ekip üyelerini tutar.
 * Erişim: manager FK veya herhangi bir assignment satırı.
 */
@Service
public class ProjectAssignmentServiceImpl implements ProjectAssignmentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectAssignmentServiceImpl.class);

    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    public ProjectAssignmentServiceImpl(
            ProjectAssignmentRepository projectAssignmentRepository,
            UserRepository userRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.userRepository = userRepository;
        this.projectAccessService = projectAccessService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectAssignmentResponse> listAssignments(Long projectId) {
        projectAccessService.requireReadableProject(projectId);
        return projectAssignmentRepository.findByProjectIdWithUser(projectId).stream()
                .map(ProjectAssignmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProjectAssignmentResponse assignUser(Long projectId, CreateProjectAssignmentRequest request) {
        Project project = projectAccessService.requireReadableProject(projectId);
        User user = userRepository.findByIdWithRole(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BusinessRuleException("Pasif kullanıcı projeye atanamaz.");
        }

        if (projectAssignmentRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new ConflictException("Bu kullanıcı bu projeye zaten atanmıştır.");
        }

        String role = resolveAssignmentRole(request.assignmentRole(), user);

        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setUser(user);
        assignment.setAssignmentRole(role);

        ProjectAssignment saved = projectAssignmentRepository.save(assignment);
        LOGGER.info("assignment.created projectId={} userId={} role={}", projectId, user.getId(), role);
        return ProjectAssignmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void removeAssignment(Long projectId, Long userId) {
        Project project = projectAccessService.requireReadableProject(projectId);

        ProjectAssignment assignment = projectAssignmentRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Atama bulunamadı."));

        if (project.getManager() != null && userId.equals(project.getManager().getId())) {
            throw new BusinessRuleException(
                    "Proje yöneticisinin ataması kaldırılamaz. Önce proje yöneticisini değiştirin."
            );
        }

        projectAssignmentRepository.delete(assignment);
        LOGGER.info("assignment.removed projectId={} userId={}", projectId, userId);
    }

    private String resolveAssignmentRole(String requested, User user) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim().toUpperCase();
        }
        if (user.getRole() != null && user.getRole().getName() != null) {
            return user.getRole().getName().name();
        }
        return "MEMBER";
    }
}
