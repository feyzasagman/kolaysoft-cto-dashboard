package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import com.kolaysoft.ctodashboard.service.RiskIssueService;
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
 * Risk endpointleri.
 */
@RestController
@RequestMapping("/api/v1/risks")
@Validated
@Tag(name = "Risks", description = "Haftalık rapora bağlı risk işlemleri")
public class RiskIssueController {

    private final RiskIssueService riskIssueService;

    public RiskIssueController(RiskIssueService riskIssueService) {
        this.riskIssueService = riskIssueService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Riskleri sayfalı listeler")
    public ResponseEntity<ApiResponse<PageResponse<RiskIssueResponse>>> getRisks(
            @Parameter(description = "Başlık / açıklama araması")
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long reportId,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) RiskStatus status,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "id,asc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Riskler listelendi.",
                        riskIssueService.getRisks(search, reportId, riskLevel, status, page, size, sort)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Yeni risk oluşturur")
    public ResponseEntity<ApiResponse<RiskIssueResponse>> createRisk(
            @Valid @RequestBody CreateRiskIssueRequest request
    ) {
        RiskIssueResponse created = riskIssueService.createRisk(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Risk oluşturuldu.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Riski günceller")
    public ResponseEntity<ApiResponse<RiskIssueResponse>> updateRisk(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRiskIssueRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Risk güncellendi.", riskIssueService.updateRisk(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Riski siler")
    public ResponseEntity<ApiResponse<Void>> deleteRisk(@PathVariable Long id) {
        riskIssueService.deleteRisk(id);
        return ResponseEntity.ok(ApiResponse.success("Risk silindi.", null));
    }
}
