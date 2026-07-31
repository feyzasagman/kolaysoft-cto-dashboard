package com.kolaysoft.ctodashboard.dto.request;

import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * İş kalemi güncelleme isteği.
 */
public record UpdateWorkItemRequest(
        @NotBlank(message = "Başlık zorunludur.")
        @Size(max = 255, message = "Başlık en fazla 255 karakter olabilir.")
        String title,

        String description,

        @Size(max = 150, message = "Atanan kişi en fazla 150 karakter olabilir.")
        String assignee,

        @NotNull(message = "Durum zorunludur.")
        WorkItemStatus status,

        LocalDate plannedDate,

        LocalDate completedDate,

        String note
) {
}
