package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectManagerRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.ProjectAssignment;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.ProjectMapper;
import com.kolaysoft.ctodashboard.repository.ProjectAssignmentRepository;
import com.kolaysoft.ctodashboard.repository.ProjectRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.service.ProjectService;
import com.kolaysoft.ctodashboard.specification.ProjectSpecifications;
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
 * Proje CRUD iş kuralları.
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectServiceImpl.class);
    private static final Set<String> ALLOWED_SORT = Set.of("id", "name", "code", "status", "createdAt");

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ProjectAssignmentRepository projectAssignmentRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProjectResponse> getProjects(
            String search,
            ProjectStatus status,
            Long managerId,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageableUtils.toPageable(page, size, sort, ALLOWED_SORT, "name");
        Page<Project> projectPage = projectRepository.findAll(
                ProjectSpecifications.withFilters(search, status, managerId),
                pageable
        );

        List<Long> ids = projectPage.getContent().stream().map(Project::getId).toList();
        Map<Long, Project> withManager = ids.isEmpty()
                ? Map.of()
                : projectRepository.findByIdInWithManager(ids).stream()
                .collect(Collectors.toMap(Project::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));

        List<ProjectResponse> content = ids.stream()
                .map(withManager::get)
                .map(ProjectMapper::toResponse)
                .toList();

        LOGGER.info("projects.list page={} size={} total={}", page, size, projectPage.getTotalElements());
        return PageResponse.of(content, page, size, projectPage.getTotalElements());
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
        ensureManagerAssignment(saved, manager);
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
        ensureManagerAssignment(project, manager);
        return ProjectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectManager(Long id, UpdateProjectManagerRequest request) {
        Project project = findProjectOrThrow(id);
        User manager = resolveProjectManager(request.managerId());
        project.setManager(manager);
        projectRepository.save(project);
        ensureManagerAssignment(project, manager);
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

    /**
     * Ana PM için assignment satırı yoksa oluşturur (Model A: manager FK + assignment senkron).
     */
    private void ensureManagerAssignment(Project project, User manager) {
        if (projectAssignmentRepository.existsByProjectIdAndUserId(project.getId(), manager.getId())) {
            return;
        }
        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setUser(manager);
        assignment.setAssignmentRole(RoleType.PROJECT_MANAGER.name());
        projectAssignmentRepository.save(assignment);
        LOGGER.info(
                "assignment.synced projectId={} managerId={}",
                project.getId(),
                manager.getId()
        );
    }
}
