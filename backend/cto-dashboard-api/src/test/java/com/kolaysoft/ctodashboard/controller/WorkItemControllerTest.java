package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.WorkItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkItemController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class WorkItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WorkItemService workItemService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void shouldCreateWorkItem() throws Exception {
        when(workItemService.createWorkItem(any())).thenReturn(
                new WorkItemResponse(
                        1L,
                        5L,
                        "API entegrasyonu",
                        "Rapor servisi",
                        "Ali Veli",
                        "IN_PROGRESS",
                        LocalDate.of(2026, 8, 1),
                        null,
                        "Devam ediyor"
                )
        );

        mockMvc.perform(post("/api/v1/work-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reportId": 5,
                                  "title": "API entegrasyonu",
                                  "description": "Rapor servisi",
                                  "assignee": "Ali Veli",
                                  "status": "IN_PROGRESS",
                                  "plannedDate": "2026-08-01",
                                  "note": "Devam ediyor"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("API entegrasyonu"))
                .andExpect(jsonPath("$.data.reportId").value(5));
    }
}
