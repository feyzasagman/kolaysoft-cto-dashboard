package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WeeklyReportResponse;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.WeeklyReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
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

@WebMvcTest(controllers = WeeklyReportController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class WeeklyReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WeeklyReportService weeklyReportService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldCreateReport() throws Exception {
        when(weeklyReportService.createReport(any())).thenReturn(
                new WeeklyReportResponse(
                        1L,
                        10L,
                        "PRJ-001",
                        "CTO Dashboard",
                        2026,
                        31,
                        LocalDate.of(2026, 7, 31),
                        40,
                        35,
                        "ACTIVE",
                        "ON_TRACK",
                        "Tamamlanan işler",
                        "Planlanan işler",
                        "Genel not"
                )
        );

        mockMvc.perform(post("/api/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectId": 10,
                                  "weekNumber": 31,
                                  "reportDate": "2026-07-31",
                                  "plannedProgress": 40,
                                  "actualProgress": 35,
                                  "projectStatus": "ACTIVE",
                                  "scheduleStatus": "ON_TRACK",
                                  "completedWork": "Tamamlanan işler",
                                  "plannedWork": "Planlanan işler",
                                  "overallNote": "Genel not"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.weekNumber").value(31))
                .andExpect(jsonPath("$.data.projectId").value(10));
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldReturnConflictForDuplicateReport() throws Exception {
        when(weeklyReportService.createReport(any())).thenThrow(
                new ConflictException("Bu proje ve hafta için rapor zaten mevcut.")
        );

        mockMvc.perform(post("/api/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectId": 10,
                                  "weekNumber": 31,
                                  "reportDate": "2026-07-31",
                                  "plannedProgress": 40,
                                  "actualProgress": 35
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Bu proje ve hafta için rapor zaten mevcut."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestWhenValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectId": null,
                                  "weekNumber": 99,
                                  "reportDate": null,
                                  "plannedProgress": 150,
                                  "actualProgress": -1
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Doğrulama hatası."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListReportsPaginated() throws Exception {
        when(weeklyReportService.getReports(isNull(), isNull(), isNull(), isNull(), anyInt(), anyInt(), anyString()))
                .thenReturn(PageResponse.of(
                        List.of(new WeeklyReportResponse(
                                1L, 10L, "PRJ-001", "CTO Dashboard", 2026, 31,
                                LocalDate.of(2026, 7, 31), 40, 35, "ACTIVE", "ON_TRACK",
                                "Tamamlanan", "Planlanan", "Not"
                        )),
                        0,
                        20,
                        1
                ));

        mockMvc.perform(get("/api/v1/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].weekNumber").value(31))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldListReportsByProjectPaginated() throws Exception {
        when(weeklyReportService.getReportsByProjectId(eq(10L), anyInt(), anyInt(), anyString()))
                .thenReturn(PageResponse.of(List.of(), 0, 10, 0));

        mockMvc.perform(get("/api/v1/reports/project/10").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.size").value(10));
    }

    @Test
    void shouldReturnUnauthorizedWhenTokenMissing() throws Exception {
        mockMvc.perform(get("/api/v1/reports"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldForbidCtoFromCreatingReport() throws Exception {
        mockMvc.perform(post("/api/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectId": 10,
                                  "weekNumber": 31,
                                  "reportDate": "2026-07-31"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("Bu işlem için yetkiniz bulunmamaktadır."));
    }
}
