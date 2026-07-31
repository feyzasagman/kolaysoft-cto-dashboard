package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDateTime;

/**
 * Kullanıcı cevap DTO'su. Şifre alanı içermez.
 */
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean active,
        LocalDateTime createdAt
) {
}
