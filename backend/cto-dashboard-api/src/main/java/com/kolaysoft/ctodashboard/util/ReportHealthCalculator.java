package com.kolaysoft.ctodashboard.util;

import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.enums.ReportHealth;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;

import java.util.Collection;
import java.util.Locale;

/**
 * Haftalık rapordan proje sağlık durumunu türetir.
 * Entity'de overallHealth alanı olmadığı için scheduleStatus, progress ve açık riskler kullanılır.
 */
public final class ReportHealthCalculator {

    private ReportHealthCalculator() {
    }

    public static ReportHealth calculate(WeeklyReport report, Collection<RiskIssue> reportRisks) {
        if (report == null) {
            return null;
        }

        ReportHealth fromSchedule = fromScheduleStatus(report.getScheduleStatus());
        ReportHealth fromProgress = fromProgress(report.getPlannedProgress(), report.getActualProgress());
        ReportHealth fromRisks = fromOpenRisks(reportRisks);

        return worst(fromSchedule, fromProgress, fromRisks);
    }

    private static ReportHealth fromScheduleStatus(String scheduleStatus) {
        if (scheduleStatus == null || scheduleStatus.isBlank()) {
            return null;
        }
        String normalized = scheduleStatus.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("RED")
                || normalized.contains("DELAY")
                || normalized.contains("BEHIND")
                || normalized.contains("CRITICAL")) {
            return ReportHealth.RED;
        }
        if (normalized.contains("YELLOW")
                || normalized.contains("AT_RISK")
                || normalized.contains("RISK")
                || normalized.contains("WARNING")) {
            return ReportHealth.YELLOW;
        }
        if (normalized.contains("GREEN")
                || normalized.contains("ON_TRACK")
                || normalized.contains("OK")) {
            return ReportHealth.GREEN;
        }
        return null;
    }

    private static ReportHealth fromProgress(Integer planned, Integer actual) {
        if (planned == null || actual == null) {
            return ReportHealth.GREEN;
        }
        int gap = planned - actual;
        if (gap >= 20) {
            return ReportHealth.RED;
        }
        if (gap >= 10) {
            return ReportHealth.YELLOW;
        }
        return ReportHealth.GREEN;
    }

    private static ReportHealth fromOpenRisks(Collection<RiskIssue> reportRisks) {
        if (reportRisks == null || reportRisks.isEmpty()) {
            return null;
        }
        boolean hasCritical = reportRisks.stream().anyMatch(risk ->
                isOpen(risk) && risk.getRiskLevel() == RiskLevel.CRITICAL);
        if (hasCritical) {
            return ReportHealth.RED;
        }
        boolean hasHigh = reportRisks.stream().anyMatch(risk ->
                isOpen(risk) && risk.getRiskLevel() == RiskLevel.HIGH);
        if (hasHigh) {
            return ReportHealth.YELLOW;
        }
        return null;
    }

    private static boolean isOpen(RiskIssue risk) {
        return risk.getStatus() != RiskStatus.RESOLVED && risk.getStatus() != RiskStatus.ACCEPTED;
    }

    private static ReportHealth worst(ReportHealth... values) {
        ReportHealth result = ReportHealth.GREEN;
        for (ReportHealth value : values) {
            if (value == null) {
                continue;
            }
            if (value == ReportHealth.RED) {
                return ReportHealth.RED;
            }
            if (value == ReportHealth.YELLOW) {
                result = ReportHealth.YELLOW;
            }
        }
        return result;
    }
}
