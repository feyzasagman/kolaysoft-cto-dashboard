package com.kolaysoft.ctodashboard.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Login isteği DTO'su.
 */
public record LoginRequest(
        @NotBlank(message = "E-posta adresi zorunludur.")
        @Email(message = "Geçerli bir e-posta adresi giriniz.")
        String email,

        @NotBlank(message = "Şifre zorunludur.")
        String password
) {
}
