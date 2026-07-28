package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationFilter;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        JwtAuthenticationFilter.class,
        GlobalExceptionHandler.class
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldLoginSuccessfully() throws Exception {
        when(authService.login(any())).thenReturn(
                new LoginResponse("jwt-token", 1L, "ADMIN", "System Admin")
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@kolaysoft.com.tr",
                                  "password": "Admin123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("jwt-token"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.fullName").value("System Admin"));
    }

    @Test
    void shouldReturnNotFoundWhenEmailDoesNotExist() throws Exception {
        when(authService.login(any())).thenThrow(
                new ResourceNotFoundException("Bu e-posta adresine ait kullanıcı bulunamadı.")
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "missing@kolaysoft.com.tr",
                                  "password": "Admin123!"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Bu e-posta adresine ait kullanıcı bulunamadı."));
    }

    @Test
    void shouldReturnUnauthorizedWhenPasswordIsWrong() throws Exception {
        when(authService.login(any())).thenThrow(
                new InvalidCredentialsException("E-posta adresi veya şifre hatalı.")
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@kolaysoft.com.tr",
                                  "password": "WrongPassword"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("E-posta adresi veya şifre hatalı."));
    }

    @Test
    void shouldReturnForbiddenWhenUserIsInactive() throws Exception {
        when(authService.login(any())).thenThrow(
                new UserInactiveException("Kullanıcı hesabı pasif durumdadır.")
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "inactive@kolaysoft.com.tr",
                                  "password": "Admin123!"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Kullanıcı hesabı pasif durumdadır."));
    }
}
