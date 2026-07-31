package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDate;

/**
 * İş kalemi cevap DTO'su.
 */
public record WorkItemResponse(
        Long id,
        Long reportId,
        String title,
        String description,
        String assignee,
        String status,
        LocalDate plannedDate,
        LocalDate completedDate,
        String note
) {
}
