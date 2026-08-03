package com.kolaysoft.ctodashboard.exception;

import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.ErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String UNEXPECTED_ERROR_MESSAGE = "Beklenmeyen bir hata oluştu.";
    private static final String INVALID_CREDENTIALS_MESSAGE = "E-posta adresi veya şifre hatalı.";
    private static final String INACTIVE_USER_MESSAGE = "Kullanıcı hesabı aktif değildir.";
    private static final String ACCESS_DENIED_MESSAGE = "Bu işlem için yetkiniz bulunmamaktadır.";
    private static final String VALIDATION_MESSAGE = "Doğrulama hatası.";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleResourceNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), "NOT_FOUND", request, null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleConflict(
            ConflictException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.CONFLICT, exception.getMessage(), "CONFLICT", request, null);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleBusinessRule(
            BusinessRuleException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), "BUSINESS_RULE", request, null);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse<ErrorDetail>> handleAccessDenied(HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ACCESS_DENIED_MESSAGE, "FORBIDDEN", request, null);
    }

    @ExceptionHandler({InvalidCredentialsException.class, BadCredentialsException.class})
    public ResponseEntity<ApiResponse<ErrorDetail>> handleInvalidCredentials(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        String message = exception.getMessage() == null || exception.getMessage().isBlank()
                ? INVALID_CREDENTIALS_MESSAGE
                : exception.getMessage();
        return build(HttpStatus.UNAUTHORIZED, message, "UNAUTHORIZED", request, null);
    }

    @ExceptionHandler({UserInactiveException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<ApiResponse<ErrorDetail>> handleUserInactive(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        String message = exception.getMessage() == null || exception.getMessage().isBlank()
                ? INACTIVE_USER_MESSAGE
                : exception.getMessage();
        return build(HttpStatus.FORBIDDEN, message, "USER_INACTIVE", request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE, "VALIDATION_ERROR", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String path = violation.getPropertyPath() == null
                    ? "param"
                    : violation.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            errors.put(field, violation.getMessage());
        }
        return build(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE, "VALIDATION_ERROR", request, errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fields = Map.of(
                exception.getName(),
                "Geçersiz parametre değeri."
        );
        return build(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE, "TYPE_MISMATCH", request, fields);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleMissingParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fields = Map.of(
                exception.getParameterName(),
                "Zorunlu parametre eksik."
        );
        return build(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE, "MISSING_PARAMETER", request, fields);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleUnreadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        LOGGER.warn("Okunamayan istek gövdesi: path={}", request.getRequestURI());
        return build(
                HttpStatus.BAD_REQUEST,
                "İstek gövdesi okunamadı veya geçersiz JSON.",
                "MALFORMED_REQUEST",
                request,
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        LOGGER.error("Beklenmeyen bir uygulama hatası oluştu. path={}", request.getRequestURI(), exception);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, UNEXPECTED_ERROR_MESSAGE, "INTERNAL_ERROR", request, null);
    }

    private ResponseEntity<ApiResponse<ErrorDetail>> build(
            HttpStatus status,
            String message,
            String code,
            HttpServletRequest request,
            Map<String, String> fields
    ) {
        return ResponseEntity
                .status(status)
                .body(new ApiResponse<>(false, message, ErrorDetail.of(code, request.getRequestURI(), fields)));
    }
}
