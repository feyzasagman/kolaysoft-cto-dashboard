package com.kolaysoft.ctodashboard.dto.request;

import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.enums.RiskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Risk oluşturma isteği.
 */
public record CreateRiskIssueRequest(
        @NotNull(message = "Rapor kimliği zorunludur.")
        Long reportId,

        @NotBlank(message = "Başlık zorunludur.")
        @Size(max = 255, message = "Başlık en fazla 255 karakter olabilir.")
        String title,

        String description,

        @NotNull(message = "Risk seviyesi zorunludur.")
        RiskLevel riskLevel,

        String impact,

        String actionPlan,

        @NotNull(message = "Durum zorunludur.")
        RiskStatus status
) {
}
