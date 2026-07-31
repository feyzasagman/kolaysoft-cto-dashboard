package com.kolaysoft.ctodashboard.service.impl;

import com.kolaysoft.ctodashboard.dto.request.CreateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.UserResponse;
import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.exception.ConflictException;
import com.kolaysoft.ctodashboard.exception.ResourceNotFoundException;
import com.kolaysoft.ctodashboard.mapper.UserMapper;
import com.kolaysoft.ctodashboard.repository.RoleRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import com.kolaysoft.ctodashboard.service.UserService;
import com.kolaysoft.ctodashboard.util.FullNameParser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Kullanıcı CRUD iş kuralları.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllWithRole().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserMapper.toResponse(findUserOrThrow(id));
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        ensureEmailUnique(email, null);

        FullNameParser.NameParts nameParts = FullNameParser.parse(request.fullName());
        Role role = findRoleOrThrow(request.role());

        User user = new User();
        user.setFirstName(nameParts.firstName());
        user.setLastName(nameParts.lastName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setRole(role);

        User saved = userRepository.save(user);
        return UserMapper.toResponse(findUserOrThrow(saved.getId()));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);
        String email = normalizeEmail(request.email());
        ensureEmailUnique(email, id);

        FullNameParser.NameParts nameParts = FullNameParser.parse(request.fullName());
        Role role = findRoleOrThrow(request.role());

        user.setFirstName(nameParts.firstName());
        user.setLastName(nameParts.lastName());
        user.setEmail(email);
        user.setRole(role);

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        userRepository.save(user);
        return UserMapper.toResponse(findUserOrThrow(id));
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = findUserOrThrow(id);
        user.setActive(request.active());
        userRepository.save(user);
        return UserMapper.toResponse(findUserOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
    }

    private Role findRoleOrThrow(RoleType roleType) {
        return roleRepository.findByName(roleType)
                .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + roleType.name()));
    }

    private void ensureEmailUnique(String email, Long currentUserId) {
        boolean exists = currentUserId == null
                ? userRepository.existsByEmail(email)
                : userRepository.existsByEmailAndIdNot(email, currentUserId);

        if (exists) {
            throw new ConflictException("Bu e-posta adresi zaten kullanılmaktadır.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
