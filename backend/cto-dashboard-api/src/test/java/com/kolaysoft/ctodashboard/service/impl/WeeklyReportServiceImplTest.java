package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.entity.WeeklyReport;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.repository.RiskIssueRepository;
import com.kolaysoft.ctodashboard.repository.WeeklyReportRepository;
import com.kolaysoft.ctodashboard.service.ProjectAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeeklyReportServiceImplTest {

    @Mock
    private WeeklyReportRepository weeklyReportRepository;

    @Mock
    private RiskIssueRepository riskIssueRepository;

    @Mock
    private ProjectAccessService projectAccessService;

    @InjectMocks
    private WeeklyReportServiceImpl weeklyReportService;

    private Project project;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(10L);
        project.setCode("D16-P1");
        project.setName("Day16 Project");
    }

    @Test
    void shouldRejectDuplicateWeekWithContractMessage() {
        when(projectAccessService.requireWritableProject(10L)).thenReturn(project);
        when(weeklyReportRepository.existsByProjectIdAndWeekNumber(10L, 40)).thenReturn(true);

        CreateWeeklyReportRequest request = new CreateWeeklyReportRequest(
                10L,
                40,
                LocalDate.of(2026, 10, 1),
                50,
                50,
                "ACTIVE",
                "ON_TRACK",
                null,
                null,
                null
        );

        assertThatThrownBy(() -> weeklyReportService.createReport(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.");

        verify(weeklyReportRepository, never()).save(any());
    }

    @Test
    void shouldRejectDelayedCreateWithoutOpenRisk() {
        when(projectAccessService.requireWritableProject(10L)).thenReturn(project);
        when(weeklyReportRepository.existsByProjectIdAndWeekNumber(10L, 41)).thenReturn(false);

        CreateWeeklyReportRequest request = new CreateWeeklyReportRequest(
                10L,
                41,
                LocalDate.of(2026, 10, 8),
                50,
                50,
                "ACTIVE",
                "DELAYED",
                null,
                null,
                null
        );

        assertThatThrownBy(() -> weeklyReportService.createReport(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("açık risk");

        verify(weeklyReportRepository, never()).save(any());
    }

    @Test
    void shouldAllowHealthyCreateWithoutRisks() {
        when(projectAccessService.requireWritableProject(10L)).thenReturn(project);
        when(weeklyReportRepository.existsByProjectIdAndWeekNumber(10L, 42)).thenReturn(false);

        WeeklyReport saved = new WeeklyReport();
        saved.setId(99L);
        saved.setProject(project);
        saved.setWeekNumber(42);
        saved.setYear(2026);
        saved.setReportDate(LocalDate.of(2026, 10, 15));
        saved.setScheduleStatus("ON_TRACK");
        saved.setPlannedProgress(50);
        saved.setActualProgress(50);

        when(weeklyReportRepository.save(any(WeeklyReport.class))).thenReturn(saved);
        when(weeklyReportRepository.findByIdWithProject(99L)).thenReturn(Optional.of(saved));

        CreateWeeklyReportRequest request = new CreateWeeklyReportRequest(
                10L,
                42,
                LocalDate.of(2026, 10, 15),
                50,
                50,
                "ACTIVE",
                "ON_TRACK",
                "completed",
                "planned",
                "note"
        );

        weeklyReportService.createReport(request);

        verify(weeklyReportRepository).save(any(WeeklyReport.class));
    }

    @Test
    void shouldAllowUpdateToDelayedWhenOpenRiskExists() {
        WeeklyReport existing = new WeeklyReport();
        existing.setId(7L);
        existing.setProject(project);
        existing.setWeekNumber(43);
        existing.setYear(2026);
        existing.setReportDate(LocalDate.of(2026, 10, 22));
        existing.setScheduleStatus("ON_TRACK");
        existing.setPlannedProgress(50);
        existing.setActualProgress(50);

        RiskIssue openRisk = new RiskIssue();
        openRisk.setRiskLevel(RiskLevel.HIGH);
        openRisk.setStatus(RiskStatus.OPEN);

        when(weeklyReportRepository.findByIdWithProject(7L)).thenReturn(Optional.of(existing));
        when(projectAccessService.requireWritableProject(10L)).thenReturn(project);
        when(weeklyReportRepository.existsByProjectIdAndWeekNumberAndIdNot(10L, 43, 7L)).thenReturn(false);
        when(riskIssueRepository.findByWeeklyReportId(7L)).thenReturn(List.of(openRisk));
        when(weeklyReportRepository.save(any(WeeklyReport.class))).thenReturn(existing);

        weeklyReportService.updateReport(7L, new com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest(
                43,
                LocalDate.of(2026, 10, 22),
                50,
                50,
                "ACTIVE",
                "DELAYED",
                null,
                null,
                null
        ));

        verify(weeklyReportRepository).save(any(WeeklyReport.class));
    }
}
