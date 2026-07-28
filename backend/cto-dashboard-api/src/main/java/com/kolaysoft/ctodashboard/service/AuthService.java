package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.LoginRequest;
import com.kolaysoft.ctodashboard.dto.response.LoginResponse;

/**
 * Kimlik doğrulama iş kurallarını tanımlar.
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);
}
