package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.LoginRequest;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.security.CustomUserDetails;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Login doğrulama ve JWT üretimi.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "E-posta adresi veya şifre hatalı.";
    private static final String INACTIVE_USER_MESSAGE = "Kullanıcı hesabı aktif değildir.";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmailWithRole(principal.getUsername())
                    .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new UserInactiveException(INACTIVE_USER_MESSAGE);
            }

            String accessToken = jwtService.generateToken(principal);

            return new LoginResponse(
                    accessToken,
                    "Bearer",
                    jwtService.getExpirationSeconds(),
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().getName().name()
            );
        } catch (DisabledException | LockedException exception) {
            throw new UserInactiveException(INACTIVE_USER_MESSAGE);
        } catch (BadCredentialsException exception) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        } catch (AuthenticationException exception) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }
    }
}
