package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * ProjectAssignment entity kalıcılık işlemleri.
 */
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    List<ProjectAssignment> findByUserId(Long userId);

    List<ProjectAssignment> findByProjectId(Long projectId);

    Optional<ProjectAssignment> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
}
