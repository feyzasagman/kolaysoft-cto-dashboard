package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Role entity kalıcılık işlemleri.
 */
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType name);

    boolean existsByName(RoleType name);
}
