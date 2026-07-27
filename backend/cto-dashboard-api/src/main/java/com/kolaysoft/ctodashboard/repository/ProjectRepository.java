package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.Project;
import com.kolaysoft.ctodashboard.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Project entity kalıcılık işlemleri.
 */
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByNameContainingIgnoreCase(String name);
}
