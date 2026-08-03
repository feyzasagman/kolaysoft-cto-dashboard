package com.kolaysoft.ctodashboard.repository;

import com.kolaysoft.ctodashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * User entity kalıcılık işlemleri.
 */
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.id = :id")
    Optional<User> findByIdWithRole(@Param("id") Long id);

    @Query("SELECT u FROM User u JOIN FETCH u.role ORDER BY u.id ASC")
    List<User> findAllWithRole();

    @Query("""
            SELECT DISTINCT u FROM User u
            JOIN FETCH u.role
            WHERE u.id IN :ids
            """)
    List<User> findByIdInWithRole(@Param("ids") Collection<Long> ids);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<User> findByActiveTrue();
}
