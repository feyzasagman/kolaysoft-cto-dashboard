package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.CriticalRiskResponse;
import com.kolaysoft.ctodashboard.dto.response.DashboardSummaryResponse;
import com.kolaysoft.ctodashboard.dto.response.HealthDistributionResponse;
import com.kolaysoft.ctodashboard.dto.response.LatestReportResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardDetailResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardResponse;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import com.kolaysoft.ctodashboard.enums.ReportHealth;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import com.kolaysoft.ctodashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CTO dashboard endpointleri.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@Validated
@Tag(name = "Dashboard", description = "CTO dashboard özet ve analitik işlemleri")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Dashboard özet metriklerini getirir")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard özeti getirildi.", dashboardService.getSummary())
        );
    }

    @GetMapping("/health-distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Aktif projelerin sağlık dağılımını getirir")
    public ResponseEntity<ApiResponse<HealthDistributionResponse>> getHealthDistribution() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sağlık dağılımı getirildi.",
                        dashboardService.getHealthDistribution()
                )
        );
    }

    @GetMapping("/critical-risks")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Kritik risk ve engelleri listeler")
    public ResponseEntity<ApiResponse<List<CriticalRiskResponse>>> getCriticalRisks(
            @Parameter(description = "Risk seviyesi filtresi")
            @RequestParam(required = false) RiskLevel level,
            @Parameter(description = "Risk durumu filtresi")
            @RequestParam(required = false) RiskStatus status,
            @Parameter(description = "Proje kimliği filtresi")
            @RequestParam(required = false) Long projectId,
            @Parameter(description = "Maksimum kayıt sayısı (1-100)")
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "limit en az 1 olmalıdır.")
            @Max(value = 100, message = "limit en fazla 100 olabilir.")
            int limit
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Kritik riskler listelendi.",
                        dashboardService.getCriticalRisks(level, status, projectId, limit)
                )
        );
    }

    @GetMapping("/latest-reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "En güncel haftalık raporları listeler")
    public ResponseEntity<ApiResponse<List<LatestReportResponse>>> getLatestReports(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) ReportHealth health,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false)
            @Min(value = 2000, message = "year 2000 veya sonrası olmalıdır.")
            @Max(value = 2100, message = "year 2100 veya öncesi olmalıdır.")
            Integer year,
            @RequestParam(required = false)
            @Min(value = 1, message = "weekNumber en az 1 olmalıdır.")
            @Max(value = 53, message = "weekNumber en fazla 53 olabilir.")
            Integer weekNumber,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "limit en az 1 olmalıdır.")
            @Max(value = 100, message = "limit en fazla 100 olabilir.")
            int limit
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Son raporlar listelendi.",
                        dashboardService.getLatestReports(
                                projectId, managerId, health, status, year, weekNumber, limit
                        )
                )
        );
    }

    @GetMapping("/projects")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Dashboard proje listesini sayfalı getirir")
    public ResponseEntity<ApiResponse<PageResponse<ProjectDashboardResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) ProjectStatus projectStatus,
            @RequestParam(required = false) ReportHealth health,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false)
            @Min(value = 2000, message = "year 2000 veya sonrası olmalıdır.")
            @Max(value = 2100, message = "year 2100 veya öncesi olmalıdır.")
            Integer year,
            @RequestParam(required = false)
            @Min(value = 1, message = "weekNumber en az 1 olmalıdır.")
            @Max(value = 53, message = "weekNumber en fazla 53 olabilir.")
            Integer weekNumber,
            @RequestParam(required = false) Boolean hasCurrentWeekReport,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "name,asc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard projeleri listelendi.",
                        dashboardService.getProjects(
                                search,
                                managerId,
                                projectStatus,
                                health,
                                riskLevel,
                                year,
                                weekNumber,
                                hasCurrentWeekReport,
                                page,
                                size,
                                sort
                        )
                )
        );
    }

    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Dashboard proje detay özetini getirir")
    public ResponseEntity<ApiResponse<ProjectDashboardDetailResponse>> getProjectDetail(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje dashboard detayı getirildi.",
                        dashboardService.getProjectDetail(projectId)
                )
        );
    }
}
