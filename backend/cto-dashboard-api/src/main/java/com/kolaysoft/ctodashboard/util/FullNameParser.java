package com.kolaysoft.ctodashboard.util;

/**
 * Ad soyad metnini firstName / lastName bileşenlerine ayırır.
 */
public final class FullNameParser {

    private FullNameParser() {
    }

    public static NameParts parse(String fullName) {
        String normalized = fullName == null ? "" : fullName.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Ad soyad zorunludur.");
        }

        int separatorIndex = normalized.indexOf(' ');
        if (separatorIndex < 0) {
            return new NameParts(normalized, normalized);
        }

        String firstName = normalized.substring(0, separatorIndex);
        String lastName = normalized.substring(separatorIndex + 1);
        return new NameParts(firstName, lastName);
    }

    public record NameParts(String firstName, String lastName) {
    }
}
