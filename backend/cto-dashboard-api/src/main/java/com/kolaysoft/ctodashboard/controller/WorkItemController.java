package com.kolaysoft.ctodashboard.controller;

import com.kolaysoft.ctodashboard.dto.request.CreateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.request.UpdateWorkItemRequest;
import com.kolaysoft.ctodashboard.dto.response.ApiResponse;
import com.kolaysoft.ctodashboard.dto.response.PageResponse;
import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.enums.WorkItemStatus;
import com.kolaysoft.ctodashboard.service.WorkItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * İş kalemi endpointleri.
 */
@RestController
@RequestMapping("/api/v1/work-items")
@Validated
@Tag(name = "Work Items", description = "Haftalık rapora bağlı iş kalemi işlemleri")
public class WorkItemController {

    private final WorkItemService workItemService;

    public WorkItemController(WorkItemService workItemService) {
        this.workItemService = workItemService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CTO', 'PROJECT_MANAGER')")
    @Operation(summary = "İş kalemlerini sayfalı listeler")
    public ResponseEntity<ApiResponse<PageResponse<WorkItemResponse>>> getWorkItems(
            @Parameter(description = "Başlık / açıklama / atanan araması")
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long reportId,
            @RequestParam(required = false) WorkItemStatus status,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page 0 veya daha büyük olmalıdır.")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "size en az 1 olmalıdır.")
            @Max(value = 100, message = "size en fazla 100 olabilir.")
            int size,
            @RequestParam(defaultValue = "id,asc") String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "İş kalemleri listelendi.",
                        workItemService.getWorkItems(search, reportId, status, page, size, sort)
                )
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
