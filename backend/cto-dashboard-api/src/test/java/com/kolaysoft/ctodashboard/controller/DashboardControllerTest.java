package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.CriticalRiskResponse;
import com.kolaysoft.ctodashboard.dto.response.DashboardSummaryResponse;
import com.kolaysoft.ctodashboard.dto.response.HealthDistributionResponse;
import com.kolaysoft.ctodashboard.dto.response.LatestReportResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardDetailResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectDashboardResponse;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnSummaryForAdmin() throws Exception {
        when(dashboardService.getSummary()).thenReturn(
                new DashboardSummaryResponse(5, 3, 1, 1, 0, 2, 10, 10, 0, 4, 1, 2, 1)
        );

        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalProjects").value(5))
                .andExpect(jsonPath("$.data.activeProjects").value(3))
                .andExpect(jsonPath("$.data.criticalRisks").value(1))
                .andExpect(jsonPath("$.data.projectsWithoutCurrentWeekReport").value(1));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldReturnHealthDistributionForCto() throws Exception {
        when(dashboardService.getHealthDistribution()).thenReturn(
                new HealthDistributionResponse(2, 1, 1, 1)
        );

        mockMvc.perform(get("/api/v1/dashboard/health-distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.green").value(2))
                .andExpect(jsonPath("$.data.yellow").value(1))
                .andExpect(jsonPath("$.data.red").value(1))
                .andExpect(jsonPath("$.data.noReport").value(1));
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldForbidProjectManagerFromSummary() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("Bu işlem için yetkiniz bulunmamaktadır."));
    }

    @Test
    void shouldReturnUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnCriticalRisks() throws Exception {
        when(dashboardService.getCriticalRisks(isNull(), isNull(), isNull(), eq(10))).thenReturn(List.of(
                new CriticalRiskResponse(
                        1L, 2L, "PRJ-001", "Demo", 3L, "Kaynak riski", "RISK",
                        "CRITICAL", "OPEN", "Plan", LocalDateTime.of(2026, 7, 31, 0, 0)
                )
        ));

        mockMvc.perform(get("/api/v1/dashboard/critical-risks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].impactLevel").value("CRITICAL"))
                .andExpect(jsonPath("$.data[0].status").value("OPEN"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldApplyLatestReportsLimit() throws Exception {
        when(dashboardService.getLatestReports(
                isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(2)
        )).thenReturn(List.of(
                sampleLatestReport(1L),
                sampleLatestReport(2L)
        ));

        mockMvc.perform(get("/api/v1/dashboard/latest-reports").param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnPaginatedProjects() throws Exception {
        when(dashboardService.getProjects(
                any(), any(), any(), any(), any(), any(), any(), any(), eq(0), eq(20), anyString()
        )).thenReturn(PageResponse.of(
                List.of(new ProjectDashboardResponse(
                        1L, "PRJ-001", "Demo", 2L, "Ali", "ACTIVE", "GREEN",
                        2026, 31, 40, 35, 1, 0, 0, LocalDate.of(2026, 7, 31), true
                )),
                0,
                20,
                1
        ));

        mockMvc.perform(get("/api/v1/dashboard/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].code").value("PRJ-001"));
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldAllowAssignedManagerToViewProjectDetail() throws Exception {
        when(dashboardService.getProjectDetail(1L)).thenReturn(
                new ProjectDashboardDetailResponse(
                        1L, "PRJ-001", "Demo", "desc", "ACTIVE",
                        LocalDate.of(2026, 7, 1), LocalDate.of(2026, 12, 31),
                        2L, "Ali", "pm@kolaysoft.com.tr",
                        null, "GREEN", 40, 35, 0, 0, 1, List.of()
                )
        );

        mockMvc.perform(get("/api/v1/dashboard/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.projectId").value(1))
                .andExpect(jsonPath("$.data.code").value("PRJ-001"));
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldForbidUnassignedManagerFromProjectDetail() throws Exception {
        when(dashboardService.getProjectDetail(99L))
                .thenThrow(new AccessDeniedException("Bu işlem için yetkiniz bulunmamaktadır."));

        mockMvc.perform(get("/api/v1/dashboard/projects/99"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestForInvalidLimit() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/critical-risks").param("limit", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Doğrulama hatası."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestForInvalidWeekNumber() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/latest-reports").param("weekNumber", "99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Doğrulama hatası."));
    }

    private LatestReportResponse sampleLatestReport(Long id) {
        return new LatestReportResponse(
                id, 1L, "PRJ-001", "Demo", 2L, "Ali", 2026, 31, "GREEN",
                40, 35, "SUBMITTED",
                LocalDateTime.of(2026, 7, 31, 0, 0),
                LocalDateTime.of(2026, 7, 31, 0, 0),
                0, 0
        );
    }
}
