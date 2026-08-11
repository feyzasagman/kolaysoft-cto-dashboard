package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.ProjectAssignmentResponse;
import com.kolaysoft.ctodashboard.exception.BusinessRuleException;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.ProjectAssignmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProjectAssignmentController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class ProjectAssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectAssignmentService projectAssignmentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListAssignmentsAsAdmin() throws Exception {
        when(projectAssignmentService.listAssignments(1L)).thenReturn(List.of(
                new ProjectAssignmentResponse(
                        10L, 1L, 2L, "Ali Veli", "ali@kolaysoft.com.tr",
                        "PROJECT_MANAGER", true, "PROJECT_MANAGER",
                        LocalDateTime.of(2026, 8, 1, 10, 0)
                )
        ));

        mockMvc.perform(get("/api/v1/projects/1/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].userId").value(2));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldListAssignmentsAsCto() throws Exception {
        when(projectAssignmentService.listAssignments(1L)).thenReturn(List.of());
        mockMvc.perform(get("/api/v1/projects/1/assignments"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAssignUserAsAdmin() throws Exception {
        when(projectAssignmentService.assignUser(eq(1L), any())).thenReturn(
                new ProjectAssignmentResponse(
                        11L, 1L, 3L, "Ayşe", "ayse@kolaysoft.com.tr",
                        "PROJECT_MANAGER", true, "MEMBER",
                        LocalDateTime.of(2026, 8, 10, 12, 0)
                )
        );

        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "userId": 3, "assignmentRole": "MEMBER" }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userId").value(3));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldForbidCtoFromAssigning() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"userId\": 3 }"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldForbidPmFromAssigning() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"userId\": 3 }"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnConflictOnDuplicateAssignment() throws Exception {
        when(projectAssignmentService.assignUser(eq(1L), any()))
                .thenThrow(new ConflictException("Bu kullanıcı bu projeye zaten atanmıştır."));

        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"userId\": 3 }"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldRejectInactiveUserAssignment() throws Exception {
        when(projectAssignmentService.assignUser(eq(1L), any()))
                .thenThrow(new BusinessRuleException("Pasif kullanıcı projeye atanamaz."));

        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"userId\": 3 }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.code").value("BUSINESS_RULE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnNotFoundForMissingUser() throws Exception {
        when(projectAssignmentService.assignUser(eq(1L), any()))
                .thenThrow(new ResourceNotFoundException("Kullanıcı bulunamadı."));

        mockMvc.perform(post("/api/v1/projects/1/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"userId\": 999 }"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldRemoveAssignment() throws Exception {
        doNothing().when(projectAssignmentService).removeAssignment(1L, 3L);
        mockMvc.perform(delete("/api/v1/projects/1/assignments/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "CTO")
    void shouldForbidCtoFromRemovingAssignment() throws Exception {
        mockMvc.perform(delete("/api/v1/projects/1/assignments/3"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/projects/1/assignments"))
                .andExpect(status().isUnauthorized());
    }
}
