package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateRiskIssueRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.service.RiskIssueService;
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
 * Risk endpointleri.
 */
@RestController
@RequestMapping("/api/v1/risks")
@Tag(name = "Risks", description = "Haftalık rapora bağlı risk işlemleri")
public class RiskIssueController {

    private final RiskIssueService riskIssueService;

    public RiskIssueController(RiskIssueService riskIssueService) {
        this.riskIssueService = riskIssueService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "Riskleri listeler")
    public ResponseEntity<ApiResponse<List<RiskIssueResponse>>> getAllRisks() {
        return ResponseEntity.ok(
                ApiResponse.success("Riskler listelendi.", riskIssueService.getAllRisks())
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
