package com.kolaysoft.ctodashboard.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Standart hata detayı. ApiResponse.data alanında kullanılabilir.
 */
public record ErrorDetail(
        String code,
        String path,
        Instant timestamp,
        Map<String, String> fields
) {

    public static ErrorDetail of(String code, String path) {
        return new ErrorDetail(code, path, Instant.now(), null);
    }

    public static ErrorDetail of(String code, String path, Map<String, String> fields) {
        return new ErrorDetail(code, path, Instant.now(), fields);
    }
}
