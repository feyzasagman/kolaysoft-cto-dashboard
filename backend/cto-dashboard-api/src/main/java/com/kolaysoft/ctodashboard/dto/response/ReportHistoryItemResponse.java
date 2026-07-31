package com.kolaysoft.ctodashboard.dto.response;

import java.time.LocalDateTime;

/**
 * Proje detayındaki rapor geçmişi satırı.
 */
public record ReportHistoryItemResponse(
        Integer year,
        Integer weekNumber,
        String health,
        Integer progressTarget,
        Integer progressActual,
        LocalDateTime submittedAt
) {
}
