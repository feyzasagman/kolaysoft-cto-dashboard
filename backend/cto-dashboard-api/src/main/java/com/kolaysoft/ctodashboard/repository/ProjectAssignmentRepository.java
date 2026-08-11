package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * ProjectAssignment entity kalıcılık işlemleri.
 */
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    List<ProjectAssignment> findByUserId(Long userId);

    List<ProjectAssignment> findByProjectId(Long projectId);

    @Query("""
            SELECT a FROM ProjectAssignment a
            JOIN FETCH a.user u
            JOIN FETCH u.role
            JOIN FETCH a.project
            WHERE a.project.id = :projectId
            ORDER BY a.assignedAt ASC
            """)
    List<ProjectAssignment> findByProjectIdWithUser(@Param("projectId") Long projectId);

    Optional<ProjectAssignment> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
}
