package com.kolaysoft.ctodashboard.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Proje yöneticisi güncelleme isteği.
 */
public record UpdateProjectManagerRequest(
        @NotNull(message = "Proje yöneticisi zorunludur.")
        Long managerId
) {
}
