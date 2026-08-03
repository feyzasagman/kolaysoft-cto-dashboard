package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateUserStatusRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.UserResponse;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Kullanıcı yönetim endpointleri.
 */
@RestController
@RequestMapping("/api/v1/users")
@Validated
@Tag(name = "Users", description = "Kullanıcı yönetim işlemleri")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Kullanıcıları sayfalı listeler")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @Parameter(description = "E-posta / ad / soyad araması")
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RoleType role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "id,asc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Kullanıcılar listelendi.",
                        userService.getUsers(search, role, active, page, size, sort)
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO')")
    @Operation(summary = "Kullanıcı detayını getirir")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Kullanıcı getirildi.", userService.getUserById(id))
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Yeni kullanıcı oluşturur")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kullanıcı oluşturuldu.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kullanıcı bilgilerini günceller")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Kullanıcı güncellendi.", userService.updateUser(id, request))
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kullanıcı aktiflik durumunu günceller")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Kullanıcı durumu güncellendi.",
                        userService.updateUserStatus(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kullanıcıyı siler")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı silindi.", null));
    }
}
