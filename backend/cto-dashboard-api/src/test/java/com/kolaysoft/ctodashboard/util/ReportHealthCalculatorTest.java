package com.kolaysoft.ctodashboard.util;

import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.enums.ReportHealth;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ReportHealthCalculatorTest {

    @Test
    void shouldReturnGreenWhenOnTrack() {
        WeeklyReport report = new WeeklyReport();
        report.setScheduleStatus("ON_TRACK");
        report.setPlannedProgress(50);
        report.setActualProgress(50);

        assertThat(ReportHealthCalculator.calculate(report, List.of())).isEqualTo(ReportHealth.GREEN);
    }

    @Test
    void shouldReturnRedWhenCriticalOpenRiskExists() {
        WeeklyReport report = new WeeklyReport();
        report.setScheduleStatus("ON_TRACK");
        report.setPlannedProgress(50);
        report.setActualProgress(50);

        RiskIssue risk = new RiskIssue();
        risk.setRiskLevel(RiskLevel.CRITICAL);
        risk.setStatus(RiskStatus.OPEN);

        assertThat(ReportHealthCalculator.calculate(report, List.of(risk))).isEqualTo(ReportHealth.RED);
    }

    @Test
    void shouldReturnYellowWhenProgressBehind() {
        WeeklyReport report = new WeeklyReport();
        report.setPlannedProgress(50);
        report.setActualProgress(35);

        assertThat(ReportHealthCalculator.calculate(report, List.of())).isEqualTo(ReportHealth.YELLOW);
    }

    @Test
    void shouldFlagUnhealthyWithoutOpenRisksForDelayedSchedule() {
        WeeklyReport report = new WeeklyReport();
        report.setScheduleStatus("DELAYED");
        report.setPlannedProgress(50);
        report.setActualProgress(50);

        assertThat(ReportHealthCalculator.isUnhealthyWithoutOpenRisks(report, List.of())).isTrue();
    }

    @Test
    void shouldNotFlagUnhealthyWhenOpenRiskDocumentsRedHealth() {
        WeeklyReport report = new WeeklyReport();
        report.setScheduleStatus("DELAYED");
        report.setPlannedProgress(50);
        report.setActualProgress(50);

        RiskIssue risk = new RiskIssue();
        risk.setRiskLevel(RiskLevel.HIGH);
        risk.setStatus(RiskStatus.OPEN);

        assertThat(ReportHealthCalculator.isUnhealthyWithoutOpenRisks(report, List.of(risk))).isFalse();
    }

    @Test
    void shouldNotFlagHealthyReportWithoutRisks() {
        WeeklyReport report = new WeeklyReport();
        report.setScheduleStatus("ON_TRACK");
        report.setPlannedProgress(50);
        report.setActualProgress(50);

        assertThat(ReportHealthCalculator.isUnhealthyWithoutOpenRisks(report, List.of())).isFalse();
    }
}
