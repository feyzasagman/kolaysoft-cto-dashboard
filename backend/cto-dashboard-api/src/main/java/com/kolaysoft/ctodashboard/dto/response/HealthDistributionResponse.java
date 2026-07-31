package com.kolaysoft.ctodashboard.dto.response;

/**
 * Aktif projelerin sağlık dağılımı.
 */
public record HealthDistributionResponse(
        long green,
        long yellow,
        long red,
        long noReport
) {
}
