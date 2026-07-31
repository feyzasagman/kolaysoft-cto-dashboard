package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;

import java.util.List;

/**
 * Haftalık rapor iş kuralları.
 */
public interface WeeklyReportService {

    List<WeeklyReportResponse> getAllReports();

    WeeklyReportResponse getReportById(Long id);

    List<WeeklyReportResponse> getReportsByProjectId(Long projectId);

    WeeklyReportResponse createReport(CreateWeeklyReportRequest request);

    WeeklyReportResponse updateReport(Long id, UpdateWeeklyReportRequest request);

    void deleteReport(Long id);
}
