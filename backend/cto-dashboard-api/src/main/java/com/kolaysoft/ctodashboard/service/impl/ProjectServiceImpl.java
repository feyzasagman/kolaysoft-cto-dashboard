package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectManagerRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.ProjectMapper;
import com.kolaysoft.ctodashboard.repository.ProjectRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Proje CRUD iş kuralları.
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAllWithManager().stream()
                .map(ProjectMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return ProjectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        String code = normalizeCode(request.code());
        ensureCodeUnique(code, null);
        User manager = resolveProjectManager(request.managerId());

        Project project = new Project();
        project.setCode(code);
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setManager(manager);
        project.setStatus(request.status() == null ? ProjectStatus.PLANNED : request.status());
        project.setStartDate(request.startDate());
        project.setEndDate(request.targetEndDate());

        Project saved = projectRepository.save(project);
        return ProjectMapper.toResponse(findProjectOrThrow(saved.getId()));
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, UpdateProjectRequest request) {
        Project project = findProjectOrThrow(id);
        String code = normalizeCode(request.code());
        ensureCodeUnique(code, id);
        User manager = resolveProjectManager(request.managerId());

        project.setCode(code);
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setManager(manager);
        project.setStatus(request.status());
        project.setStartDate(request.startDate());
        project.setEndDate(request.targetEndDate());

        projectRepository.save(project);
        return ProjectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectManager(Long id, UpdateProjectManagerRequest request) {
        Project project = findProjectOrThrow(id);
        project.setManager(resolveProjectManager(request.managerId()));
        projectRepository.save(project);
        return ProjectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectStatus(Long id, UpdateProjectStatusRequest request) {
        Project project = findProjectOrThrow(id);
        project.setStatus(request.status());
        projectRepository.save(project);
        return ProjectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        Project project = findProjectOrThrow(id);
        projectRepository.delete(project);
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findByIdWithManager(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proje bulunamadı."));
    }

    private User resolveProjectManager(Long managerId) {
        User manager = userRepository.findByIdWithRole(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Proje yöneticisi bulunamadı."));

        if (!Boolean.TRUE.equals(manager.getActive())) {
            throw new BusinessRuleException("Proje yöneticisi aktif olmalıdır.");
        }

        if (manager.getRole().getName() != RoleType.PROJECT_MANAGER) {
            throw new BusinessRuleException("Proje yöneticisi PROJECT_MANAGER rolüne sahip olmalıdır.");
        }

        return manager;
    }

    private void ensureCodeUnique(String code, Long currentProjectId) {
        boolean exists = currentProjectId == null
                ? projectRepository.existsByCode(code)
                : projectRepository.existsByCodeAndIdNot(code, currentProjectId);

        if (exists) {
            throw new ConflictException("Bu proje kodu zaten kullanılmaktadır.");
        }
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }
}
