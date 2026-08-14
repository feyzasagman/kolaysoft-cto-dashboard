package com.kolaysoft.ctodashboard.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DatasourceUrlEnvironmentPostProcessorTest {

    private final DatasourceUrlEnvironmentPostProcessor processor = new DatasourceUrlEnvironmentPostProcessor();
    private final SpringApplication application = new SpringApplication();

    @Test
    void jdbcUrlIsAccepted() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("DB_URL", "jdbc:postgresql://example:5432/cto_dashboard");

        assertThatCode(() -> processor.postProcessEnvironment(environment, application))
                .doesNotThrowAnyException();
    }

    @Test
    void postgresSchemeIsRejected() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("DB_URL", "postgres://user:pass@example:5432/cto_dashboard");

        assertThatThrownBy(() -> processor.postProcessEnvironment(environment, application))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("jdbc:postgresql://");
    }

    @Test
    void postgresqlSchemeIsRejected() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("spring.datasource.url", "postgresql://example:5432/cto_dashboard");

        assertThatThrownBy(() -> processor.postProcessEnvironment(environment, application))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("jdbc:postgresql://");
    }
}
