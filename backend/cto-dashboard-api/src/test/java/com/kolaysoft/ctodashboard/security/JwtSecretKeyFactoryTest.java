package com.kolaysoft.ctodashboard.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtSecretKeyFactoryTest {

    /**
     * 32 ASCII chars, all in the Base64 alphabet, length % 4 == 0.
     * Decodes to 24 bytes (192 bits) — below JJWT's 256-bit HMAC minimum.
     */
    private static final String ACCIDENTAL_BASE64_PASSPHRASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";

    @Test
    void passphraseThatLooksLikeBase64DoesNotFailStartup() {
        JwtSecretKeyFactory.ResolvedKey resolved = JwtSecretKeyFactory.fromSecret(ACCIDENTAL_BASE64_PASSPHRASE);

        assertThat(resolved.source()).isEqualTo("utf8");
        assertThat(resolved.byteLength()).isEqualTo(32);
        assertThat(resolved.secretKey().getAlgorithm()).isEqualTo("HmacSHA256");
    }

    @Test
    void jjwtBlindBase64DecodeWouldRejectAccidentalBase64Passphrase() {
        byte[] decoded = Decoders.BASE64.decode(ACCIDENTAL_BASE64_PASSPHRASE);
        assertThat(decoded.length).isEqualTo(24);
        assertThatThrownBy(() -> Keys.hmacShaKeyFor(decoded))
                .isInstanceOf(WeakKeyException.class);
    }

    @Test
    void sixtyFourByteBase64SecretUsesDecodedBytes() {
        byte[] raw = new byte[64];
        for (int i = 0; i < raw.length; i++) {
            raw[i] = (byte) (i + 1);
        }
        String encoded = Base64.getEncoder().encodeToString(raw);

        JwtSecretKeyFactory.ResolvedKey resolved = JwtSecretKeyFactory.fromSecret(encoded);

        assertThat(resolved.source()).isEqualTo("base64");
        assertThat(resolved.byteLength()).isEqualTo(64);
        assertThat(resolved.secretKey().getAlgorithm()).isEqualTo("HmacSHA512");
    }

    @Test
    void opensslWrappedBase64IsAcceptedAfterWhitespaceStrip() {
        byte[] raw = new byte[64];
        for (int i = 0; i < raw.length; i++) {
            raw[i] = (byte) (255 - i);
        }
        String wrapped = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(raw);

        JwtSecretKeyFactory.ResolvedKey resolved = JwtSecretKeyFactory.fromSecret(wrapped);

        assertThat(resolved.source()).isEqualTo("base64");
        assertThat(resolved.byteLength()).isEqualTo(64);
    }

    @Test
    void blankSecretFailsWithPreciseMessage() {
        assertThatThrownBy(() -> JwtSecretKeyFactory.fromSecret("   "))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("missing or blank");
    }

    @Test
    void shortSecretFailsWithBitLength() {
        assertThatThrownBy(() -> JwtSecretKeyFactory.fromSecret("short-secret"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("too short")
                .hasMessageContaining("bits");
    }

    @Test
    void wrappingQuotesAreStripped() {
        String inner = "Not-base64! use-utf8-path-with-more-than-32-chars";
        JwtSecretKeyFactory.ResolvedKey resolved = JwtSecretKeyFactory.fromSecret("\"" + inner + "\"");

        assertThat(resolved.source()).isEqualTo("utf8");
        assertThat(resolved.byteLength()).isEqualTo(inner.getBytes(StandardCharsets.UTF_8).length);
    }
}
