package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;
import com.kolaysoft.ctodashboard.service.WeeklyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Haftalık rapor endpointleri.
 */
@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Weekly Reports", description = "Haftalık rapor yönetim işlemleri")
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    public WeeklyReportController(WeeklyReportService weeklyReportService) {
        this.weeklyReportService = weeklyReportService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Haftalık raporları listeler")
    public ResponseEntity<ApiResponse<List<WeeklyReportResponse>>> getAllReports() {
        return ResponseEntity.ok(
                ApiResponse.success("Haftalık raporlar listelendi.", weeklyReportService.getAllReports())
        );
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Projeye ait haftalık raporları listeler")
    public ResponseEntity<ApiResponse<List<WeeklyReportResponse>>> getReportsByProject(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje raporları listelendi.",
                        weeklyReportService.getReportsByProjectId(projectId)
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Haftalık rapor detayını getirir")
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Haftalık rapor getirildi.", weeklyReportService.getReportById(id))
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Yeni haftalık rapor oluşturur")
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> createReport(
            @Valid @RequestBody CreateWeeklyReportRequest request
    ) {
        WeeklyReportResponse created = weeklyReportService.createReport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Haftalık rapor oluşturuldu.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Haftalık raporu günceller")
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWeeklyReportRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Haftalık rapor güncellendi.", weeklyReportService.updateReport(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Haftalık raporu siler")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        weeklyReportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.success("Haftalık rapor silindi.", null));
    }
}
