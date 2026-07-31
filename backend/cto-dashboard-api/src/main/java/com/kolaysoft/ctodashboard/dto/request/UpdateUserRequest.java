package com.kolaysoft.ctodashboard.dto.request;

import com.kolaysoft.ctodashboard.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Kullanıcı güncelleme isteği.
 */
public record UpdateUserRequest(
        @NotBlank(message = "Ad soyad zorunludur.")
        @Size(max = 200, message = "Ad soyad en fazla 200 karakter olabilir.")
        String fullName,

        @NotBlank(message = "E-posta adresi zorunludur.")
        @Email(message = "Geçerli bir e-posta adresi giriniz.")
        String email,

        @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır.")
        String password,

        @NotNull(message = "Rol zorunludur.")
        RoleType role
) {
}
