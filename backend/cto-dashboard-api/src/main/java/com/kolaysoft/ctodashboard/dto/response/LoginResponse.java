package com.kolaysoft.ctodashboard.dto.response;

/**
 * Başarılı login cevabı DTO'su.
 */
public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String fullName,
        String email,
        String role
) {
}
