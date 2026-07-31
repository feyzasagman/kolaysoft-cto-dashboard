package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;

/**
 * WeeklyReport entity ↔ DTO dönüşümleri.
 */
public final class WeeklyReportMapper {

    private WeeklyReportMapper() {
    }

    public static WeeklyReportResponse toResponse(WeeklyReport report) {
        Project project = report.getProject();
        return new WeeklyReportResponse(
                report.getId(),
                project.getId(),
                project.getCode(),
                project.getName(),
                report.getYear(),
                report.getWeekNumber(),
                report.getReportDate(),
                report.getPlannedProgress(),
                report.getActualProgress(),
                report.getProjectStatus(),
                report.getScheduleStatus(),
                report.getCompletedWork(),
                report.getPlannedWork(),
                report.getOverallNote()
        );
    }
}
