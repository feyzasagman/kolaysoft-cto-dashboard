package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        JwtAuthenticationFilter.class
})
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldReturnApiHealthStatus() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("CTO Dashboard API çalışıyor."))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.application").value("cto-dashboard-api"));
    }
}
