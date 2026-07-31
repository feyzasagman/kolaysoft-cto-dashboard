package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.User;

/**
 * Project entity ↔ DTO dönüşümleri.
 */
public final class ProjectMapper {

    private ProjectMapper() {
    }

    public static ProjectResponse toResponse(Project project) {
        User manager = project.getManager();
        return new ProjectResponse(
                project.getId(),
                project.getCode(),
                project.getName(),
                project.getDescription(),
                manager == null ? null : manager.getId(),
                manager == null ? null : manager.getFullName(),
                manager == null ? null : manager.getEmail(),
                project.getStatus().name(),
                project.getStartDate(),
                project.getEndDate(),
                project.getCreatedAt()
        );
    }
}
