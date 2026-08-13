package com.kolaysoft.ctodashboard.config;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

class CorsConfigTest {

    @Test
    void parseOriginsKeepsLocalDefaultsAndTrims() {
        List<String> origins = CorsConfig.parseOrigins(
                "http://localhost:5173, http://localhost:3000 ,https://example.onrender.com"
        );
        Assertions.assertEquals(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "https://example.onrender.com"
                ),
                origins
        );
    }

    @Test
    void parseOriginsRejectsWildcard() {
        Assertions.assertThrows(IllegalStateException.class, () -> CorsConfig.parseOrigins("*"));
    }

    @Test
    void parseOriginsRejectsBlank() {
        Assertions.assertThrows(IllegalStateException.class, () -> CorsConfig.parseOrigins(" , "));
    }
}
