package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateProjectAssignmentRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectAssignmentResponse;
import com.kolaysoft.ctodashboard.service.ProjectAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Proje ekip / atama endpointleri.
 * Model: Project.managerId = ana PM; ProjectAssignment = ek atamalar.
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/assignments")
@Validated
@Tag(name = "Project Assignments", description = "Proje kullanıcı atama işlemleri")
public class ProjectAssignmentController {

    private final ProjectAssignmentService projectAssignmentService;

    public ProjectAssignmentController(ProjectAssignmentService projectAssignmentService) {
        this.projectAssignmentService = projectAssignmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Proje atamalarını listeler")
    public ResponseEntity<ApiResponse<List<ProjectAssignmentResponse>>> listAssignments(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje atamaları listelendi.",
                        projectAssignmentService.listAssignments(projectId)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Projeye kullanıcı atar")
    public ResponseEntity<ApiResponse<ProjectAssignmentResponse>> assignUser(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateProjectAssignmentRequest request
    ) {
        ProjectAssignmentResponse created = projectAssignmentService.assignUser(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kullanıcı projeye atandı.", created));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Proje atamasını kaldırır")
    public ResponseEntity<ApiResponse<Void>> removeAssignment(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        projectAssignmentService.removeAssignment(projectId, userId);
        return ResponseEntity.ok(ApiResponse.success("Atama kaldırıldı.", null));
    }
}
