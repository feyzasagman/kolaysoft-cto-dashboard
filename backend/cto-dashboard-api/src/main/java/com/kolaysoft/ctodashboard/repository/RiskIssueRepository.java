package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.RiskIssue;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * RiskIssue entity kalıcılık işlemleri.
 */
public interface RiskIssueRepository extends JpaRepository<RiskIssue, Long> {

    List<RiskIssue> findByWeeklyReportId(Long weeklyReportId);

    List<RiskIssue> findByRiskLevel(RiskLevel riskLevel);

    List<RiskIssue> findByStatus(RiskStatus status);
}
