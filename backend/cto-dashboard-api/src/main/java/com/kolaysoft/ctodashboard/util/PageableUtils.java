package com.kolaysoft.ctodashboard.util;

import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;
import java.util.Set;

/**
 * Ortak sıralama ve Pageable üretimi.
 */
public final class PageableUtils {

    private PageableUtils() {
    }

    public static Pageable toPageable(int page, int size, String sort, Set<String> allowedFields, String defaultField) {
        return PageRequest.of(page, size, parseSort(sort, allowedFields, defaultField));
    }

    public static Sort parseSort(String sort, Set<String> allowedFields, String defaultField) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, defaultField);
        }

        String[] parts = sort.split(",");
        String property = parts[0].trim();
        if (!allowedFields.contains(property)) {
            throw new BusinessRuleException("Geçersiz sıralama alanı: " + property);
        }

        Sort.Direction direction = parts.length > 1
                && "desc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }

    public static String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
