package com.kolaysoft.ctodashboard.dto.response;

/**
 * Başarılı login cevabı DTO'su.
 */
public record LoginResponse(
        String token,
        Long userId,
        String role,
        String fullName
) {
}
