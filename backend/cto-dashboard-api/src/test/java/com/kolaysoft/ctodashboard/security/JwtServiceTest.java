package com.kolaysoft.ctodashboard.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                "KolaysoftCtoDashboardDevSecretKeyForJwtSigningMustBeLongEnough",
                3_600_000L
        );
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtService.generateToken(
                "admin@kolaysoft.com.tr",
                Map.of("role", "ADMIN", "userId", 1L)
        );

        assertThat(token).isNotBlank();
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin@kolaysoft.com.tr");
        assertThat(jwtService.extractExpiration(token)).isAfter(new Date());
    }

    @Test
    void shouldRejectInvalidToken() {
        assertThat(jwtService.validateToken("invalid.token.value")).isFalse();
    }
}
