package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDate;
import java.util.List;

/**
 * Dashboard proje detay özeti.
 */
public record ProjectDashboardDetailResponse(
        Long projectId,
        String code,
        String name,
        String description,
        String projectStatus,
        LocalDate startDate,
        LocalDate targetEndDate,
        Long managerId,
        String managerName,
        String managerEmail,
        LatestReportResponse latestReport,
        String latestHealth,
        Integer progressTarget,
        Integer progressActual,
        long openRisks,
        long openBlockers,
        long reportHistoryCount,
        List<ReportHistoryItemResponse> lastFiveReports
) {
}
