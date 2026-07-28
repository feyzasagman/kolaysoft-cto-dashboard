package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.LoginRequest;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.exception.InvalidCredentialsException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.exception.UserInactiveException;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.security.JwtService;
import com.kolaysoft.ctodashboard.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Login doğrulama ve JWT üretimi.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailWithRole(request.email().trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Bu e-posta adresine ait kullanıcı bulunamadı.")
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UserInactiveException("Kullanıcı hesabı pasif durumdadır.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("E-posta adresi veya şifre hatalı.");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().getName().name());
        claims.put("fullName", user.getFullName());

        String token = jwtService.generateToken(user.getEmail(), claims);

        return new LoginResponse(
                token,
                user.getId(),
                user.getRole().getName().name(),
                user.getFullName()
        );
    }
}
