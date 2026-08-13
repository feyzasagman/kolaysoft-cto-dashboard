package com.kolaysoft.ctodashboard.actuator;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

import static org.hamcrest.Matchers.oneOf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Safe Actuator exposure: health/info public; sensitive endpoints not exposed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActuatorSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void actuatorHealthIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
    }

    @Test
    void actuatorLivenessIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void actuatorReadinessIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void actuatorInfoIsAccessibleWithoutAuthAndHasNoSecrets() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.app.name").value("cto-dashboard-api"))
                .andExpect(jsonPath("$.app.description").exists())
                .andExpect(contentBodyDoesNotLeakSecrets());
    }

    @Test
    void customApplicationHealthRemainsAvailable() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    void actuatorEnvIsNotExposed() throws Exception {
        // Not in exposure.include; Security also denies unauthenticated access (401 before 404).
        mockMvc.perform(get("/actuator/env"))
                .andExpect(status().is(oneOf(401, 404)));
    }

    @Test
    void actuatorBeansIsNotExposed() throws Exception {
        mockMvc.perform(get("/actuator/beans"))
                .andExpect(status().is(oneOf(401, 404)));
    }

    private static ResultMatcher contentBodyDoesNotLeakSecrets() {
        return result -> {
            String body = result.getResponse().getContentAsString().toLowerCase();
            Assertions.assertFalse(body.contains("password"));
            Assertions.assertFalse(body.contains("jwt"));
            Assertions.assertFalse(body.contains("secret"));
            Assertions.assertFalse(body.contains("jdbc:"));
        };
    }
}
