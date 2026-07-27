package com.kolaysoft.ctodashboard.entity;

import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Haftalık rapora bağlı iş kalemini temsil eden JPA entity.
 */
@Entity
@Table(name = "work_items")
@Getter
@Setter
@NoArgsConstructor
public class WorkItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "work_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private WeeklyReport weeklyReport;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "assignee", length = 150)
    private String assignee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private WorkItemStatus status = WorkItemStatus.TODO;

    @Column(name = "planned_date")
    private LocalDate plannedDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
