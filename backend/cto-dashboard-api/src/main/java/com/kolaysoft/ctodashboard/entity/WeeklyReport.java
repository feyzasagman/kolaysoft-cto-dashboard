package com.kolaysoft.ctodashboard.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Haftalık proje durum raporunu temsil eden JPA entity.
 */
@Entity
@Table(
        name = "weekly_reports",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_weekly_reports_project_year_week",
                columnNames = {"project_id", "year", "week_number"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class WeeklyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "planned_progress")
    private Integer plannedProgress;

    @Column(name = "actual_progress")
    private Integer actualProgress;

    @Column(name = "project_status", length = 50)
    private String projectStatus;

    @Column(name = "schedule_status", length = 50)
    private String scheduleStatus;

    @Column(name = "live_task_count")
    private Integer liveTaskCount;

    @Column(name = "completed_work", columnDefinition = "TEXT")
    private String completedWork;

    @Column(name = "planned_work", columnDefinition = "TEXT")
    private String plannedWork;

    @Column(name = "overall_note", columnDefinition = "TEXT")
    private String overallNote;

    @OneToMany(mappedBy = "weeklyReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkItem> workItems = new ArrayList<>();

    @OneToMany(mappedBy = "weeklyReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RiskIssue> riskIssues = new ArrayList<>();
}
