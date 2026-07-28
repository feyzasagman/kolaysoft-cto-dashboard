package com.kolaysoft.ctodashboard.config;

import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.repository.RoleRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Geliştirme ortamı için temel rol ve admin kullanıcısı oluşturur.
 * Registration endpointi yoktur; yalnız local test için seed yapılır.
 */
@Configuration
@Profile("dev")
public class DevDataInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(DevDataInitializer.class);
    private static final String DEV_ADMIN_EMAIL = "admin@kolaysoft.com.tr";
    private static final String DEV_ADMIN_PASSWORD = "Admin123!";

    @Bean
    CommandLineRunner seedDevelopmentUsers(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(RoleType.ADMIN);
                        role.setDescription("Sistem yöneticisi");
                        return roleRepository.save(role);
                    });

            ensureRole(roleRepository, RoleType.PROJECT_MANAGER, "Proje yöneticisi");
            ensureRole(roleRepository, RoleType.CTO, "CTO");

            if (!userRepository.existsByEmail(DEV_ADMIN_EMAIL)) {
                User admin = new User();
                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setEmail(DEV_ADMIN_EMAIL);
                admin.setPasswordHash(passwordEncoder.encode(DEV_ADMIN_PASSWORD));
                admin.setActive(true);
                admin.setRole(adminRole);
                userRepository.save(admin);
                LOGGER.info("Geliştirme admin kullanıcısı oluşturuldu: {}", DEV_ADMIN_EMAIL);
            }
        };
    }

    private void ensureRole(RoleRepository roleRepository, RoleType roleType, String description) {
        if (!roleRepository.existsByName(roleType)) {
            Role role = new Role();
            role.setName(roleType);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
