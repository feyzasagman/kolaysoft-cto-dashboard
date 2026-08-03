package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;

/**
 * Haftalık rapor iş kuralları.
 */
public interface WeeklyReportService {

    PageResponse<WeeklyReportResponse> getReports(
            String search,
            Long projectId,
            Integer year,
            Integer weekNumber,
            int page,
            int size,
            String sort
    );

    WeeklyReportResponse getReportById(Long id);

    PageResponse<WeeklyReportResponse> getReportsByProjectId(
            Long projectId,
            int page,
            int size,
            String sort
    );

    WeeklyReportResponse createReport(CreateWeeklyReportRequest request);

    WeeklyReportResponse updateReport(Long id, UpdateWeeklyReportRequest request);

    void deleteReport(Long id);
}
