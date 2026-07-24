package com.kolaysoft.ctodashboard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ctoDashboardOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Kolaysoft CTO Dashboard API")
                        .version("v1.0")
                        .description(
                                "Haftalık proje durum raporlama ve CTO takip sistemi REST API dokümantasyonu."
                        ));
    }
}
