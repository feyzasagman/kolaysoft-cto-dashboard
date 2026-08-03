package com.kolaysoft.ctodashboard.util;

import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageableUtilsTest {

    @Test
    void shouldParseAllowedSortDescending() {
        Pageable pageable = PageableUtils.toPageable(
                1,
                10,
                "name,desc",
                Set.of("name", "id"),
                "id"
        );

        assertEquals(1, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
        assertEquals(Sort.by(Sort.Direction.DESC, "name"), pageable.getSort());
    }

    @Test
    void shouldRejectUnknownSortField() {
        assertThrows(
                BusinessRuleException.class,
                () -> PageableUtils.parseSort("secret,asc", Set.of("id"), "id")
        );
    }

    @Test
    void shouldNormalizeSearchPattern() {
        assertEquals("%cto%", PageableUtils.normalizeSearch(" CTO "));
        assertTrue(PageableUtils.normalizeSearch("  ") == null);
    }
}
