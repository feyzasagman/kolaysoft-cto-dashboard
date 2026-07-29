package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.config.CorsConfig;
import com.kolaysoft.ctodashboard.config.PasswordEncoderConfig;
import com.kolaysoft.ctodashboard.config.SecurityConfig;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.exception.GlobalExceptionHandler;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.security.CustomUserDetailsService;
import com.kolaysoft.ctodashboard.security.JwtAccessDeniedHandler;
import com.kolaysoft.ctodashboard.security.JwtAuthenticationEntryPoint;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        PasswordEncoderConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class,
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
                new LoginResponse(
                        "jwt-token",
                        "Bearer",
                        3600L,
                        1L,
                        "System Admin",
                        "admin@kolaysoft.com.tr",
                        "ADMIN"
                )
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@kolaysoft.com.tr",
                                  "password": "Example123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Giriş başarılı."))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(3600))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.fullName").value("System Admin"))
                .andExpect(jsonPath("$.data.email").value("admin@kolaysoft.com.tr"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
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
    void shouldReturnBadRequestWhenRequestIsInvalid() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "not-an-email",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Doğrulama hatası."));
    }

    @Test
    void shouldReturnForbiddenWhenUserIsInactive() throws Exception {
        when(authService.login(any())).thenThrow(
                new UserInactiveException("Kullanıcı hesabı aktif değildir.")
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "inactive@kolaysoft.com.tr",
                                  "password": "Example123!"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Kullanıcı hesabı aktif değildir."));
    }

    @Test
    void shouldReturnUnauthorizedWhenProtectedEndpointHasNoToken() throws Exception {
        mockMvc.perform(get("/api/v1/secure-probe"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message")
                        .value("Bu işlemi gerçekleştirmek için giriş yapmalısınız."));
    }
}
