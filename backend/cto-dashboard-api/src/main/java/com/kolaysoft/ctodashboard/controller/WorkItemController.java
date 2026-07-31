package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.service.WorkItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * İş kalemi endpointleri.
 */
@RestController
@RequestMapping("/api/v1/work-items")
@Tag(name = "Work Items", description = "Haftalık rapora bağlı iş kalemi işlemleri")
public class WorkItemController {

    private final WorkItemService workItemService;

    public WorkItemController(WorkItemService workItemService) {
        this.workItemService = workItemService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "İş kalemlerini listeler")
    public ResponseEntity<ApiResponse<List<WorkItemResponse>>> getAllWorkItems() {
        return ResponseEntity.ok(
                ApiResponse.success("İş kalemleri listelendi.", workItemService.getAllWorkItems())
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Yeni iş kalemi oluşturur")
    public ResponseEntity<ApiResponse<WorkItemResponse>> createWorkItem(
            @Valid @RequestBody CreateWorkItemRequest request
    ) {
        WorkItemResponse created = workItemService.createWorkItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("İş kalemi oluşturuldu.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "İş kalemini günceller")
    public ResponseEntity<ApiResponse<WorkItemResponse>> updateWorkItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkItemRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("İş kalemi güncellendi.", workItemService.updateWorkItem(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "İş kalemini siler")
    public ResponseEntity<ApiResponse<Void>> deleteWorkItem(@PathVariable Long id) {
        workItemService.deleteWorkItem(id);
        return ResponseEntity.ok(ApiResponse.success("İş kalemi silindi.", null));
    }
}
