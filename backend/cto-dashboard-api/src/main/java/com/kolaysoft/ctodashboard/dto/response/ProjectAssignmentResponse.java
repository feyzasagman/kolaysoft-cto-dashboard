package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDateTime;

/**
 * Proje ataması cevap DTO'su.
 */
public record ProjectAssignmentResponse(
        Long id,
        Long projectId,
        Long userId,
        String userFullName,
        String userEmail,
        String userRole,
        boolean userActive,
        String assignmentRole,
        LocalDateTime assignedAt
) {
}
