package com.kolaysoft.ctodashboard.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI ctoDashboardOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Kolaysoft CTO Dashboard API")
                        .version("v1.1")
                        .description("""
                                Haftalık proje durum raporlama ve CTO takip sistemi REST API dokümantasyonu.

                                ## Sayfalama
                                Liste endpointleri `ApiResponse<PageResponse<T>>` döner:
                                - `page`: 0 tabanlı sayfa numarası
                                - `size`: 1-100 arası sayfa boyutu (varsayılan 20)
                                - `sort`: `alan,asc|desc` (ör. `name,asc`)

                                ## Hata formatı
                                Hatalar `ApiResponse` zarfında döner; `data` alanında `ErrorDetail`
                                (`code`, `path`, `timestamp`, `fields`) bulunur.

                                ## Güvenlik
                                Authorize ile JWT Bearer token giriniz.
                                """))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH_SCHEME, new SecurityScheme()
                                .name(BEARER_AUTH_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Authorization header: Bearer {token}")));
    }
}
