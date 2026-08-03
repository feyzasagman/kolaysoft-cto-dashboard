package com.kolaysoft.ctodashboard.service;

import com.kolaysoft.ctodashboard.dto.request.CreateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.UserResponse;
import com.kolaysoft.ctodashboard.enums.RoleType;

/**
 * Kullanıcı yönetim iş kuralları.
 */
public interface UserService {

    PageResponse<UserResponse> getUsers(
            String search,
            RoleType role,
            Boolean active,
            int page,
            int size,
            String sort
    );

    UserResponse getUserById(Long id);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request);

    void deleteUser(Long id);
}
