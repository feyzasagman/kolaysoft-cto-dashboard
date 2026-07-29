package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "API çalışma durumu işlemleri")
public class HealthController {

    private final String applicationName;

    public HealthController(@Value("${spring.application.name}") String applicationName) {
        this.applicationName = applicationName;
    }

    @GetMapping
    @SecurityRequirements
    @Operation(summary = "API çalışma durumunu getirir")
    public ResponseEntity<ApiResponse<Map<String, String>>> getHealth() {
        Map<String, String> healthData = new LinkedHashMap<>();
        healthData.put("status", "UP");
        healthData.put("application", applicationName);

        return ResponseEntity.ok(
                ApiResponse.success("CTO Dashboard API çalışıyor.", healthData)
        );
    }
}
