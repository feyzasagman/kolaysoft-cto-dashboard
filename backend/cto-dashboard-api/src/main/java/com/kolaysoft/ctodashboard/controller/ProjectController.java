package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectManagerRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateProjectStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Proje yönetim endpointleri.
 */
@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects", description = "Proje yönetim işlemleri")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Tüm projeleri listeler")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAllProjects() {
        return ResponseEntity.ok(
                ApiResponse.success("Projeler listelendi.", projectService.getAllProjects())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Proje detayını getirir")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Proje getirildi.", projectService.getProjectById(id))
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Yeni proje oluşturur")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody CreateProjectRequest request
    ) {
        ProjectResponse created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Proje oluşturuldu.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Proje bilgilerini günceller")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Proje güncellendi.", projectService.updateProject(id, request))
        );
    }

    @PatchMapping("/{id}/manager")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Proje yöneticisini günceller")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProjectManager(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectManagerRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje yöneticisi güncellendi.",
                        projectService.updateProjectManager(id, request)
                )
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Proje durumunu günceller")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProjectStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectStatusRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje durumu güncellendi.",
                        projectService.updateProjectStatus(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Projeyi siler")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Proje silindi.", null));
    }
}
