package com.kolaysoft.ctodashboard.security;

import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                "KolaysoftCtoDashboardDevSecretKeyForJwtSigningMustBeLongEnough",
                3_600_000L
        );

        Role role = new Role();
        role.setName(RoleType.ADMIN);

        User user = new User();
        user.setId(1L);
        user.setFirstName("System");
        user.setLastName("Admin");
        user.setEmail("admin@kolaysoft.com.tr");
        user.setPasswordHash("hashed");
        user.setActive(true);
        user.setRole(role);

        userDetails = new CustomUserDetails(user);
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin@kolaysoft.com.tr");
        assertThat(jwtService.extractExpiration(token)).isAfter(new Date());
        assertThat(jwtService.isTokenExpired(token)).isFalse();
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
        assertThat(jwtService.getExpirationSeconds()).isEqualTo(3600L);
    }

    @Test
    void shouldRejectInvalidToken() {
        assertThat(jwtService.isTokenValid("invalid.token.value", userDetails)).isFalse();
    }
}
