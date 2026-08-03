package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.ProjectResponse;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProjectController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldCreateProjectAsAdmin() throws Exception {
        when(projectService.createProject(any())).thenReturn(
                new ProjectResponse(
                        1L,
                        "PRJ-001",
                        "CTO Dashboard",
                        "Haftalık takip",
                        2L,
                        "Ali Veli",
                        "ali.veli@kolaysoft.com.tr",
                        "PLANNED",
                        LocalDate.of(2026, 8, 1),
                        LocalDate.of(2026, 12, 31),
                        LocalDateTime.of(2026, 7, 31, 10, 0)
                )
        );

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "PRJ-001",
                                  "name": "CTO Dashboard",
                                  "description": "Haftalık takip",
                                  "managerId": 2,
                                  "status": "PLANNED",
                                  "startDate": "2026-08-01",
                                  "targetEndDate": "2026-12-31"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("PRJ-001"))
                .andExpect(jsonPath("$.data.name").value("CTO Dashboard"))
                .andExpect(jsonPath("$.data.managerId").value(2))
                .andExpect(jsonPath("$.data.status").value("PLANNED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListProjectsAsAdmin() throws Exception {
        when(projectService.getProjects(isNull(), isNull(), isNull(), anyInt(), anyInt(), anyString()))
                .thenReturn(PageResponse.of(
                        List.of(new ProjectResponse(
                                1L,
                                "PRJ-001",
                                "CTO Dashboard",
                                "Haftalık takip",
                                2L,
                                "Ali Veli",
                                "ali.veli@kolaysoft.com.tr",
                                "ACTIVE",
                                LocalDate.of(2026, 8, 1),
                                LocalDate.of(2026, 12, 31),
                                LocalDateTime.of(2026, 7, 31, 10, 0)
                        )),
                        0,
                        20,
                        1
                ));

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].code").value("PRJ-001"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void shouldReturnUnauthorizedWhenTokenMissing() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldReturnForbiddenForProjectManager() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("Bu işlem için yetkiniz bulunmamaktadır."));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldAllowCtoToReadProjects() throws Exception {
        when(projectService.getProjects(isNull(), isNull(), isNull(), anyInt(), anyInt(), anyString()))
                .thenReturn(PageResponse.of(List.of(), 0, 20, 0));

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldForbidCtoFromCreatingProject() throws Exception {
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "PRJ-002",
                                  "name": "Yeni Proje",
                                  "managerId": 2
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestWhenValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "",
                                  "name": "",
                                  "managerId": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Doğrulama hatası."));
    }
}
