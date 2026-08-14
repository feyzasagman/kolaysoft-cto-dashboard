package com.kolaysoft.ctodashboard.security;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Builds a JJWT HMAC key from {@code JWT_SECRET} without logging the secret.
 *
 * <p>JJWT {@code Keys.hmacShaKeyFor} requires &gt;= 256 bits. Blind Base64 decoding is unsafe:
 * many random ASCII secrets are valid Base64 but decode to fewer than 32 bytes, which throws
 * {@link WeakKeyException} during {@code JwtService} construction (bean startup failure).
 */
final class JwtSecretKeyFactory {

    static final int MIN_KEY_BYTES = 32;

    record ResolvedKey(SecretKey secretKey, int byteLength, String source) {
    }

    private JwtSecretKeyFactory() {
    }

    static ResolvedKey fromSecret(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is missing or blank. Set a high-entropy secret of at least 32 bytes (256 bits). "
                            + "Do not use a development fallback in prod."
            );
        }

        String trimmed = stripWrappingQuotes(secret.trim());
        byte[] utf8 = trimmed.getBytes(StandardCharsets.UTF_8);
        String compact = trimmed.replaceAll("\\s+", "");

        byte[] keyBytes = utf8;
        String source = "utf8";

        byte[] decoded = tryDecodeBase64(compact);
        if (decoded != null && decoded.length >= MIN_KEY_BYTES) {
            keyBytes = decoded;
            source = "base64";
        }

        if (keyBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short for JJWT HMAC: effective "
                            + (keyBytes.length * 8) + " bits (" + keyBytes.length
                            + " bytes), source=" + source
                            + ". Need at least 256 bits (32 bytes). "
                            + "Generate with: openssl rand -base64 64"
            );
        }

        try {
            return new ResolvedKey(Keys.hmacShaKeyFor(keyBytes), keyBytes.length, source);
        } catch (WeakKeyException exception) {
            throw new IllegalStateException(
                    "JWT_SECRET was rejected by JJWT HMAC key factory: effective "
                            + (keyBytes.length * 8) + " bits, source=" + source + ".",
                    exception
            );
        }
    }

    private static String stripWrappingQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1).trim();
            }
        }
        return value;
    }

    private static byte[] tryDecodeBase64(String compact) {
        if (compact.isEmpty()) {
            return null;
        }
        try {
            return Base64.getDecoder().decode(compact);
        } catch (IllegalArgumentException ignored) {
            try {
                return Base64.getUrlDecoder().decode(compact);
            } catch (IllegalArgumentException ignoredUrl) {
                return null;
            }
        }
    }
}
