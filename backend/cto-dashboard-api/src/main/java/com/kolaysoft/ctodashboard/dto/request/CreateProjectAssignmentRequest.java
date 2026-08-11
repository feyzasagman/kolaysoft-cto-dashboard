package com.kolaysoft.ctodashboard.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Projeye kullanıcı atama isteği.
 * assignmentRole verilmezse kullanıcının sistem rolü kullanılır.
 */
public record CreateProjectAssignmentRequest(
        @NotNull(message = "Kullanıcı kimliği zorunludur.")
        Long userId,

        @Size(max = 50, message = "Atama rolü en fazla 50 karakter olabilir.")
        String assignmentRole
) {
}
