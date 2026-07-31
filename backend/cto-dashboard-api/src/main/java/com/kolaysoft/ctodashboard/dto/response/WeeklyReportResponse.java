package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDate;

/**
 * Haftalık rapor cevap DTO'su.
 */
public record WeeklyReportResponse(
        Long id,
        Long projectId,
        String projectCode,
        String projectName,
        Integer year,
        Integer weekNumber,
        LocalDate reportDate,
        Integer plannedProgress,
        Integer actualProgress,
        String projectStatus,
        String scheduleStatus,
        String completedWork,
        String plannedWork,
        String overallNote
) {
}
