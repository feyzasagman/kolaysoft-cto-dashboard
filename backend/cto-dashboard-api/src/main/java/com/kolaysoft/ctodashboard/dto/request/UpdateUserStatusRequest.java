package com.kolaysoft.ctodashboard.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Kullanıcı aktif/pasif durumu güncelleme isteği.
 */
public record UpdateUserStatusRequest(
        @NotNull(message = "Aktiflik durumu zorunludur.")
        Boolean active
) {
}
