# Day 20 — Technical Summary

For a technical lead taking over the repository. Not a product pitch.

## Stack

| Layer | Versions (repo) |
| --- | --- |
| Backend | Java 21, Spring Boot **3.5.16**, Spring Security, Data JPA, Flyway, Actuator, springdoc 2.8.17, JJWT **0.12.6** |
| Frontend | React 18.3, TypeScript 5.8, Vite 6.4, MUI 7, TanStack Query 5, Playwright 1.55 |
| Data | PostgreSQL 16 |
| Runtime demo | Docker Compose (Temurin JRE 21 + nginx 1.27) |

## Architecture decisions

See [`../architecture/adr/README.md`](../architecture/adr/README.md):

| ADR | Decision |
| --- | --- |
| [ADR-001](../architecture/adr/ADR-001-jwt-rbac.md) | JWT + backend RBAC |
| [ADR-002](../architecture/adr/ADR-002-flyway-schema-management.md) | Flyway + `ddl-auto=validate` |
| [ADR-003](../architecture/adr/ADR-003-docker-nginx-same-origin-proxy.md) | Docker nginx same-origin `/api` |
| [ADR-004](../architecture/adr/ADR-004-deterministic-executive-insights.md) | Rule-based insights (no LLM) |
| [ADR-005](../architecture/adr/ADR-005-layered-backend-architecture.md) | Layered Spring backend |
| [ADR-006](../architecture/adr/ADR-006-testing-quality-gate-strategy.md) | Layered CI quality gate |
| [ADR-007](../architecture/adr/ADR-007-safe-actuator-observability.md) | Minimal Actuator exposure |

## Security

- Stateless Bearer JWT; secret from `JWT_SECRET` (`prod` has **no** dev fallback)
- HMAC key factory: UTF-8 unless Base64 decode yields ≥32 bytes (avoids JJWT `WeakKeyException` on accidental Base64)
- Roles: `ADMIN`, `PROJECT_MANAGER`, `CTO` — method security + HTTP matchers
- CORS: exact origins via `CORS_ALLOWED_ORIGINS` (default localhost:5173 and :3000); wildcard forbidden
- Actuator public: `/actuator/health`, probes, `/actuator/info` only
- `DevDataInitializer` is `@Profile("dev")` only
- Optional one-time `DemoBootstrapInitializer` behind `APP_DEMO_BOOTSTRAP_ENABLED` (default false)

## Data model & migrations

- Single Flyway script: `V1__init_schema.sql` (`roles`, `users`, `projects`, `project_assignments`, `weekly_reports`, `work_items`, `risk_issues`)
- Hibernate validate-only after migrate
- Report health is **derived** (`ReportHealthCalculator`), not a stored enum on create without rules

## CI/CD

`.github/workflows/ci.yml` on `push`/`PR` → `main`:

1. Backend Quality — `./mvnw -B clean verify` + JaCoCo artifact  
2. Frontend Quality — lint, `test:coverage`, production build  
3. Full Stack E2E — Postgres service, Flyway, Playwright  

No production deploy job. Coverage thresholds are **not** fail gates.

## Testing layers

| Layer | What |
| --- | --- |
| Backend JUnit | Controllers (MockMvc), JWT, health calculator, Actuator exposure, CORS parse |
| Frontend Vitest/RTL | Insights, labels, error utils, StatusBadges, Attention Center, Executive Insight |
| Playwright | Auth, ADMIN provisioning, PM report, CTO read-only |
| Docker smoke | Compose health + nginx `:3000` |

## Observability

Basic foundation only: Actuator `health` / `liveness` / `readiness` / `info`.  
No Prometheus, Grafana, tracing, or centralized logs.  
See [`../operations/Observability_and_Health_Strategy.md`](../operations/Observability_and_Health_Strategy.md).

## Docker

- Backend multi-stage JDK 21 build → JRE 21 non-root; healthcheck `wget` → readiness (`PORT` with 8080 default)
- Frontend: Vite build with `VITE_API_BASE_URL=/api/v1`, nginx proxies `/api` → `backend:8080`
- Official demo: `docker compose --env-file .env.docker.example up --build`

## Known trade-offs

- Local Docker is the **verified** delivery environment; Render was prepared and attempted, not accepted as live demo
- Insights are deterministic rules — explainable, not ML
- Coverage maps gaps; it does not prove correctness
- Same-origin nginx in Compose vs public backend URL for a future static host — two deployment shapes on purpose
