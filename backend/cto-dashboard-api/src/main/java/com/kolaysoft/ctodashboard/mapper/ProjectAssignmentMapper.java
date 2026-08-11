package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.ProjectAssignmentResponse;
import com.kolaysoft.ctodashboard.entity.ProjectAssignment;
import com.kolaysoft.ctodashboard.entity.User;

/**
 * ProjectAssignment → response dönüşümü.
 */
public final class ProjectAssignmentMapper {

    private ProjectAssignmentMapper() {
    }

    public static ProjectAssignmentResponse toResponse(ProjectAssignment assignment) {
        User user = assignment.getUser();
        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        return new ProjectAssignmentResponse(
                assignment.getId(),
                assignment.getProject().getId(),
                user.getId(),
                fullName,
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName().name() : null,
                Boolean.TRUE.equals(user.getActive()),
                assignment.getAssignmentRole(),
                assignment.getAssignedAt()
        );
    }
}
