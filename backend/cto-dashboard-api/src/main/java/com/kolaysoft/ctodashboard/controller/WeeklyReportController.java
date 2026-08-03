package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWeeklyReportRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;
import com.kolaysoft.ctodashboard.service.WeeklyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Haftalık rapor endpointleri.
 */
@RestController
@RequestMapping("/api/v1/reports")
@Validated
@Tag(name = "Weekly Reports", description = "Haftalık rapor yönetim işlemleri")
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    public WeeklyReportController(WeeklyReportService weeklyReportService) {
        this.weeklyReportService = weeklyReportService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Haftalık raporları sayfalı listeler")
    public ResponseEntity<ApiResponse<PageResponse<WeeklyReportResponse>>> getReports(
            @Parameter(description = "Proje kodu / adı araması")
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer weekNumber,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "year,desc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Haftalık raporlar listelendi.",
                        weeklyReportService.getReports(search, projectId, year, weekNumber, page, size, sort)
                )
        );
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Projeye ait haftalık raporları sayfalı listeler")
    public ResponseEntity<ApiResponse<PageResponse<WeeklyReportResponse>>> getReportsByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "year,desc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Proje raporları listelendi.",
                        weeklyReportService.getReportsByProjectId(projectId, page, size, sort)
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
