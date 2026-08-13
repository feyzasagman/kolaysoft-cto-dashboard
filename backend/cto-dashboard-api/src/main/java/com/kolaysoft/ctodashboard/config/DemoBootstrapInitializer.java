package com.kolaysoft.ctodashboard.config;

import com.kolaysoft.ctodashboard.entity.Role;
import com.kolaysoft.ctodashboard.entity.User;
import com.kolaysoft.ctodashboard.enums.RoleType;
import com.kolaysoft.ctodashboard.repository.RoleRepository;
import com.kolaysoft.ctodashboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * One-time portfolio-demo ADMIN bootstrap (opt-in).
 * Disabled by default. Never use DevDataInitializer / {@code dev} profile on public hosts.
 * After the first successful create, set {@code APP_DEMO_BOOTSTRAP_ENABLED=false}.
 */
@Component
@ConditionalOnProperty(prefix = "app.demo", name = "bootstrap-enabled", havingValue = "true")
public class DemoBootstrapInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DemoBootstrapInitializer.class);

    private final Environment environment;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoBootstrapInitializer(
            Environment environment,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.environment = environment;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = environment.getProperty("app.demo.admin-email", "").trim();
        String password = environment.getProperty("app.demo.admin-password", "");
        String firstName = environment.getProperty("app.demo.admin-first-name", "Demo").trim();
        String lastName = environment.getProperty("app.demo.admin-last-name", "Admin").trim();

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            throw new IllegalStateException(
                    "APP_DEMO_BOOTSTRAP_ENABLED=true requires DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD"
            );
        }
        if (password.length() < 12) {
            throw new IllegalStateException("DEMO_ADMIN_PASSWORD must be at least 12 characters");
        }

        ensureRole(RoleType.ADMIN, "Sistem yöneticisi");
        ensureRole(RoleType.PROJECT_MANAGER, "Proje yöneticisi");
        ensureRole(RoleType.CTO, "CTO");

        Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                .orElseThrow(() -> new IllegalStateException("ADMIN role missing after bootstrap"));

        if (userRepository.existsByEmail(email)) {
            LOGGER.info("Demo bootstrap skipped: user already exists for configured DEMO_ADMIN_EMAIL");
            LOGGER.warn("Disable APP_DEMO_BOOTSTRAP_ENABLED after first deploy (leave false in steady state)");
            return;
        }

        User admin = new User();
        admin.setFirstName(firstName.isEmpty() ? "Demo" : firstName);
        admin.setLastName(lastName.isEmpty() ? "Admin" : lastName);
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setActive(true);
        admin.setRole(adminRole);
        userRepository.save(admin);

        LOGGER.info("Demo ADMIN user created for portfolio bootstrap: {}", email);
        LOGGER.warn("Set APP_DEMO_BOOTSTRAP_ENABLED=false now; rotate DEMO_ADMIN_PASSWORD if it was temporary");
    }

    private void ensureRole(RoleType roleType, String description) {
        if (!roleRepository.existsByName(roleType)) {
            Role role = new Role();
            role.setName(roleType);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
