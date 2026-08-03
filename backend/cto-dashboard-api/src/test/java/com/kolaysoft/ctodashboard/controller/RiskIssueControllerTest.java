package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.RiskIssueResponse;
import com.kolaysoft.ctodashboard.enums.RiskLevel;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.RiskIssueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RiskIssueController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class RiskIssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RiskIssueService riskIssueService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldCreateRisk() throws Exception {
        when(riskIssueService.createRisk(any())).thenReturn(
                new RiskIssueResponse(
                        1L,
                        5L,
                        "Kaynak riski",
                        "Ekip kapasitesi yetersiz",
                        "HIGH",
                        "Teslim gecikebilir",
                        "Ek kaynak planlanacak",
                        "OPEN"
                )
        );

        mockMvc.perform(post("/api/v1/risks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reportId": 5,
                                  "title": "Kaynak riski",
                                  "description": "Ekip kapasitesi yetersiz",
                                  "riskLevel": "HIGH",
                                  "impact": "Teslim gecikebilir",
                                  "actionPlan": "Ek kaynak planlanacak",
                                  "status": "OPEN"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Kaynak riski"))
                .andExpect(jsonPath("$.data.riskLevel").value("HIGH"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListRisksPaginated() throws Exception {
        when(riskIssueService.getRisks(isNull(), isNull(), eq(RiskLevel.HIGH), isNull(), anyInt(), anyInt(), anyString()))
                .thenReturn(PageResponse.of(
                        List.of(new RiskIssueResponse(
                                1L, 5L, "Kaynak riski", "Ekip kapasitesi yetersiz",
                                "HIGH", "Teslim gecikebilir", "Ek kaynak planlanacak", "OPEN"
                        )),
                        0,
                        20,
                        1
                ));

        mockMvc.perform(get("/api/v1/risks").param("riskLevel", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].riskLevel").value("HIGH"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }
}
