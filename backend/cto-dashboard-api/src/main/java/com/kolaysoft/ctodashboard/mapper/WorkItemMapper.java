package com.kolaysoft.ctodashboard.mapper;

import com.kolaysoft.ctodashboard.dto.response.WorkItemResponse;
import com.kolaysoft.ctodashboard.entity.WorkItem;

/**
 * WorkItem entity ↔ DTO dönüşümleri.
 */
public final class WorkItemMapper {

    private WorkItemMapper() {
    }

    public static WorkItemResponse toResponse(WorkItem workItem) {
        return new WorkItemResponse(
                workItem.getId(),
                workItem.getWeeklyReport().getId(),
                workItem.getTitle(),
                workItem.getDescription(),
                workItem.getAssignee(),
                workItem.getStatus().name(),
                workItem.getPlannedDate(),
                workItem.getCompletedDate(),
                workItem.getNote()
        );
    }
}
