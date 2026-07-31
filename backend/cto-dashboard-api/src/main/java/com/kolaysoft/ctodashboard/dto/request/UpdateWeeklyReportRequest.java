package com.kolaysoft.ctodashboard.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Haftalık rapor güncelleme isteği.
 */
public record UpdateWeeklyReportRequest(
        @NotNull(message = "Hafta numarası zorunludur.")
        @Min(value = 1, message = "Hafta numarası en az 1 olmalıdır.")
        @Max(value = 53, message = "Hafta numarası en fazla 53 olabilir.")
        Integer weekNumber,

        @NotNull(message = "Rapor tarihi zorunludur.")
        LocalDate reportDate,

        @Min(value = 0, message = "Planlanan ilerleme 0-100 arasında olmalıdır.")
        @Max(value = 100, message = "Planlanan ilerleme 0-100 arasında olmalıdır.")
        Integer plannedProgress,

        @Min(value = 0, message = "Gerçekleşen ilerleme 0-100 arasında olmalıdır.")
        @Max(value = 100, message = "Gerçekleşen ilerleme 0-100 arasında olmalıdır.")
        Integer actualProgress,

        @Size(max = 50, message = "Proje durumu en fazla 50 karakter olabilir.")
        String projectStatus,

        @Size(max = 50, message = "Takvim durumu en fazla 50 karakter olabilir.")
        String scheduleStatus,

        String completedWork,

        String plannedWork,

        String overallNote
) {
}
