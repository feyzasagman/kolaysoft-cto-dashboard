package com.kolaysoft.ctodashboard.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Güvenlik bağlamından mevcut kullanıcı bilgilerini okur.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CustomUserDetails requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("Bu işlemi gerçekleştirmek için giriş yapmalısınız.");
        }
        return userDetails;
    }

    public static boolean isAdmin(CustomUserDetails user) {
        return "ADMIN".equals(user.getRole());
    }

    public static boolean isCto(CustomUserDetails user) {
        return "CTO".equals(user.getRole());
    }

    public static boolean isProjectManager(CustomUserDetails user) {
        return "PROJECT_MANAGER".equals(user.getRole());
    }
}
