package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.LoginRequest;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User activeAdmin;
    private CustomUserDetails userDetails;

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

        userDetails = new CustomUserDetails(activeAdmin);
    }

    @Test
    void shouldReturnLoginResponseWhenCredentialsAreValid() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmailWithRole("admin@kolaysoft.com.tr"))
                .thenReturn(Optional.of(activeAdmin));
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        LoginResponse response = authService.login(
                new LoginRequest("admin@kolaysoft.com.tr", "Example123!")
        );

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(3600L);
        assertThat(response.userId()).isEqualTo(10L);
        assertThat(response.fullName()).isEqualTo("System Admin");
        assertThat(response.email()).isEqualTo("admin@kolaysoft.com.tr");
        assertThat(response.role()).isEqualTo("ADMIN");
    }

    @Test
    void shouldThrowUnauthorizedWhenPasswordIsWrong() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("admin@kolaysoft.com.tr", "WrongPassword"))
        )
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("E-posta adresi veya şifre hatalı.");
    }

    @Test
    void shouldThrowUnauthorizedWhenEmailDoesNotExist() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("missing@kolaysoft.com.tr", "Example123!"))
        )
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("E-posta adresi veya şifre hatalı.");
    }

    @Test
    void shouldThrowForbiddenWhenUserIsInactive() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("User is disabled"));

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("admin@kolaysoft.com.tr", "Example123!"))
        )
                .isInstanceOf(UserInactiveException.class)
                .hasMessage("Kullanıcı hesabı aktif değildir.");
    }
}
