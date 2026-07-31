package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Proje cevap DTO'su.
 */
public record ProjectResponse(
        Long id,
        String code,
        String name,
        String description,
        Long managerId,
        String managerFullName,
        String managerEmail,
        String status,
        LocalDate startDate,
        LocalDate targetEndDate,
        LocalDateTime createdAt
) {
}
