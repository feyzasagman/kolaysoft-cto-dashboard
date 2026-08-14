package com.kolaysoft.ctodashboard.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Fail fast when Render's {@code postgres://} / {@code postgresql://} URL is pasted into {@code DB_URL}.
 * The app expects JDBC: {@code jdbc:postgresql://HOST:PORT/DATABASE}.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class DatasourceUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = firstNonBlank(
                environment.getProperty("spring.datasource.url"),
                environment.getProperty("DB_URL")
        );
        if (url == null) {
            return;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
            throw new IllegalStateException(
                    "DB_URL must be JDBC format jdbc:postgresql://HOST:PORT/DATABASE. "
                            + "Render Internal/External Database URL (postgres:// or postgresql://) is not accepted."
            );
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
