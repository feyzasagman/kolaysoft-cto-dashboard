package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.LoginRequest;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User activeAdmin;

    @BeforeEach
    void setUp() {
        Role role = new Role();
        role.setId(1L);
        role.setName(RoleType.ADMIN);

        activeAdmin = new User();
        activeAdmin.setId(10L);
        activeAdmin.setFirstName("System");
        activeAdmin.setLastName("Admin");
        activeAdmin.setEmail("admin@kolaysoft.com.tr");
        activeAdmin.setPasswordHash("hashed-password");
        activeAdmin.setActive(true);
        activeAdmin.setRole(role);
    }

    @Test
    void shouldReturnLoginResponseWhenCredentialsAreValid() {
        when(userRepository.findByEmailWithRole("admin@kolaysoft.com.tr"))
                .thenReturn(Optional.of(activeAdmin));
        when(passwordEncoder.matches("Admin123!", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(eq("admin@kolaysoft.com.tr"), anyMap())).thenReturn("jwt-token");

        LoginResponse response = authService.login(
                new LoginRequest("admin@kolaysoft.com.tr", "Admin123!")
        );

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.userId()).isEqualTo(10L);
        assertThat(response.role()).isEqualTo("ADMIN");
        assertThat(response.fullName()).isEqualTo("System Admin");
    }

    @Test
    void shouldThrowNotFoundWhenEmailDoesNotExist() {
        when(userRepository.findByEmailWithRole("missing@kolaysoft.com.tr"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("missing@kolaysoft.com.tr", "Admin123!"))
        ).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldThrowUnauthorizedWhenPasswordIsWrong() {
        when(userRepository.findByEmailWithRole("admin@kolaysoft.com.tr"))
                .thenReturn(Optional.of(activeAdmin));
        when(passwordEncoder.matches("WrongPassword", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("admin@kolaysoft.com.tr", "WrongPassword"))
        ).isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void shouldThrowForbiddenWhenUserIsInactive() {
        activeAdmin.setActive(false);
        when(userRepository.findByEmailWithRole("admin@kolaysoft.com.tr"))
                .thenReturn(Optional.of(activeAdmin));

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("admin@kolaysoft.com.tr", "Admin123!"))
        ).isInstanceOf(UserInactiveException.class);
    }
}
