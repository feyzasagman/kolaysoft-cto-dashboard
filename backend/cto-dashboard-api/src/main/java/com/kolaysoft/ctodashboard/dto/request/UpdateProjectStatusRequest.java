package com.kolaysoft.ctodashboard.dto.request;

import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Proje durumu güncelleme isteği.
 */
public record UpdateProjectStatusRequest(
        @NotNull(message = "Proje durumu zorunludur.")
        ProjectStatus status
) {
}
