package com.kolaysoft.ctodashboard.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Ortak sayfalama ve sıralama sorgu parametreleri.
 */
@Schema(name = "PageQuery", description = "Sayfalama ve sıralama parametreleri")
public record PageQuery(
        @Schema(description = "0 tabanlı sayfa numarası", example = "0", defaultValue = "0")
        @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
        Integer page,

        @Schema(description = "Sayfa boyutu (1-100)", example = "20", defaultValue = "20")
        @Min(value = 1, message = "size en az 1 olmalıdır.")
        @Max(value = 100, message = "size en fazla 100 olabilir.")
        Integer size,

        @Schema(description = "Sıralama: alan,asc|desc", example = "id,asc")
        String sort
) {

    public int resolvedPage() {
        return page == null ? 0 : page;
    }

    public int resolvedSize() {
        return size == null ? 20 : size;
    }
}
