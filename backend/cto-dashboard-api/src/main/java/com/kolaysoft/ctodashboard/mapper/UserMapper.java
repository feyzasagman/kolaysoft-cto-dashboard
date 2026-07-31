package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.UserResponse;
import com.kolaysoft.ctodashboard.entity.User;

/**
 * User entity ↔ DTO dönüşümleri.
 */
public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name(),
                Boolean.TRUE.equals(user.getActive()),
                user.getCreatedAt()
        );
    }
}
