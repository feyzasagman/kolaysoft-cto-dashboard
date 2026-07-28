package com.kolaysoft.ctodashboard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Kullanıcı hesabı pasif olduğunda fırlatılır.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UserInactiveException extends RuntimeException {

    public UserInactiveException(String message) {
        super(message);
    }
}
