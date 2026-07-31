package com.kolaysoft.ctodashboard.dto.request;

import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Proje güncelleme isteği.
 */
public record UpdateProjectRequest(
        @NotBlank(message = "Proje kodu zorunludur.")
        @Size(max = 50, message = "Proje kodu en fazla 50 karakter olabilir.")
        String code,

        @NotBlank(message = "Proje adı zorunludur.")
        @Size(max = 200, message = "Proje adı en fazla 200 karakter olabilir.")
        String name,

        String description,

        @NotNull(message = "Proje yöneticisi zorunludur.")
        Long managerId,

        @NotNull(message = "Proje durumu zorunludur.")
        ProjectStatus status,

        LocalDate startDate,

        LocalDate targetEndDate
) {
}
