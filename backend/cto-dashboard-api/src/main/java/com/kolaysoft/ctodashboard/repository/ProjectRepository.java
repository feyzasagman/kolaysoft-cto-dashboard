package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Project entity kalıcılık işlemleri.
 */
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByNameContainingIgnoreCase(String name);

    long countByStatus(ProjectStatus status);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("""
            SELECT p FROM Project p
            LEFT JOIN FETCH p.manager m
            LEFT JOIN FETCH m.role
            WHERE p.id = :id
            """)
    Optional<Project> findByIdWithManager(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN FETCH p.manager m
            LEFT JOIN FETCH m.role
            ORDER BY p.id ASC
            """)
    List<Project> findAllWithManager();

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN FETCH p.manager m
            LEFT JOIN FETCH m.role
            WHERE p.status = :status
            ORDER BY p.id ASC
            """)
    List<Project> findByStatusWithManager(@Param("status") ProjectStatus status);

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN FETCH p.manager m
            LEFT JOIN FETCH m.role
            WHERE p.id IN :ids
            """)
    List<Project> findByIdInWithManager(@Param("ids") Collection<Long> ids);
}
