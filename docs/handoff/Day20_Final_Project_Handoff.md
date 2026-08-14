# Kolaysoft CTO Dashboard — Final Project Handoff

**Date:** 2026-08-14 (Day 20)  
**Repository:** `feyzasagman/kolaysoft-cto-dashboard` · branch `main`  
**Official demo environment:** verified Docker Compose local full-stack (not public cloud)

---

## 1. Project Summary

Kolaysoft CTO Dashboard is a role-based Full Stack MVP: project managers submit weekly progress, work items and risks; the CTO monitors portfolio health, schedule/progress gap and attention items from a single dashboard. ADMIN provisions users, projects and team assignments.

This is an internship / portfolio delivery — not production-grade SaaS hosting.

---

## 2. Business Problem

Weekly status lived in email, files and ad-hoc formats. The CTO could not see portfolio health, target vs actual progress, or open risk in one place. The product standardizes reporting and gives each role a constrained, auditable workflow.

---

## 3. Implemented Roles

| Role | Responsibility |
| --- | --- |
| **ADMIN** | User CRUD, project create/update, primary manager + team assignment |
| **PROJECT_MANAGER** | Assigned projects only; weekly reports, work items, risks (write) |
| **CTO** | Full portfolio read: dashboard, Attention Center, Project Detail, Executive Insight; no write on operational data |

UI hiding is not the security boundary; backend JWT + RBAC enforces the same rules.

---

## 4. Implemented Capabilities

- JWT authentication / role-based authorization
- Users
- Projects
- Project assignments (manager + team)
- Weekly reports (health derived: GREEN / YELLOW / RED)
- Work items
- Risks / issues (YELLOW/RED reports require an open risk)
- CTO dashboard (KPI, health distribution, filters)
- Portfolio Attention Center (UI-only, deterministic)
- Executive Project Insight (rule-based, no LLM)

---

## 5. Architecture

| Layer | Choice |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, MUI, TanStack Query |
| Backend | Java 21, Spring Boot 3.5, layered controllers/services |
| Database | PostgreSQL 16 |
| Security | JWT (JJWT) + Spring Security method/HTTP RBAC |
| Migration | Flyway V1 + `ddl-auto=validate` |
| Testing | JUnit, Vitest/RTL, Playwright E2E |
| Docker | Compose: Postgres + API (JRE 21) + nginx SPA |
| CI | GitHub Actions: Backend Quality → Frontend Quality → Full Stack E2E |

ADRs: [`docs/architecture/adr/README.md`](../architecture/adr/README.md) (ADR-001 … ADR-007).

---

## 6. How to Run

**Primary path (official demo):**

```bash
docker compose --env-file .env.docker.example up --build
```

- UI: http://localhost:3000  
- API: http://localhost:8080  
- Application health: http://localhost:8080/api/v1/health  
- Actuator readiness: http://localhost:8080/actuator/health/readiness  

Details: [`../deployment/Docker_Compose_Local_Setup.md`](../deployment/Docker_Compose_Local_Setup.md)

Local Vite (`:5173`) + Maven backend remains valid for development. Do not use `dev` profile on a public host.

---

## 7. Demo Credentials

**DEMO / LOCAL ONLY** — not production credentials.

| Role | How |
| --- | --- |
| ADMIN | Dev seed (`SPRING_PROFILES_ACTIVE=dev`): `admin@kolaysoft.com.tr` / `Admin123!` |
| PROJECT_MANAGER | Not seeded — create via ADMIN → Users |
| CTO | Not seeded — create via ADMIN → Users |

Do not reuse these values outside the local Docker/Vite demo.

---

## 8. Verification Results

Measured on Day 20 handoff (local machine + GitHub Actions).

| Gate | Result |
| --- | --- |
| Backend tests | **100/100 PASS** |
| Backend `clean verify` | **PASS** (JaCoCo HTML generated) |
| Backend line / branch coverage | **39.6% / 23.9%** (JaCoCo, local snapshot) |
| Frontend unit/component | **42/42 PASS** (6 files) |
| Frontend lint | **PASS** |
| Frontend build | **PASS** |
| Frontend line / branch coverage | **9.9% / 7.6%** (Vitest V8) |
| Playwright E2E | **7/7 PASS** (local Day 20 + CI on `main` @ `6207fa0`) |
| CI Quality Gate | **PASS** on `main` @ `6207fa0` — Backend Quality, Frontend Quality, Full Stack E2E all **success** ([run](https://github.com/feyzasagman/kolaysoft-cto-dashboard/actions/runs/31831829012)) |
| `docker compose config` | **PASS** |
| Docker stack | postgres **healthy**, backend **healthy**, frontend **up** (`:3000`) |
| Health / liveness / readiness | **200 UP** |
| Flyway | V1 validated; schema version **1**; up to date |

Coverage is a measurement snapshot, not a CI fail gate.

---

## 9. Documentation Index

| Doc | Path |
| --- | --- |
| README | [`../../README.md`](../../README.md) |
| Technical summary | [`Day20_Technical_Summary.md`](Day20_Technical_Summary.md) |
| Final demo guide | [`../demo/Day20_Final_Demo_Guide.md`](../demo/Day20_Final_Demo_Guide.md) |
| Delivery checklist | [`Final_Delivery_Checklist.md`](Final_Delivery_Checklist.md) |
| Day 18 E2E demo scenario | [`../demo/Day18_End_to_End_Demo_Scenario.md`](../demo/Day18_End_to_End_Demo_Scenario.md) |
| Product tour screenshots | [`../demo/Product_Tour_Screenshot_Guide.md`](../demo/Product_Tour_Screenshot_Guide.md) |
| Docker local setup | [`../deployment/Docker_Compose_Local_Setup.md`](../deployment/Docker_Compose_Local_Setup.md) |
| Render (prep only) | [`../deployment/Render_Cloud_Deployment_Guide.md`](../deployment/Render_Cloud_Deployment_Guide.md) |
| Observability | [`../operations/Observability_and_Health_Strategy.md`](../operations/Observability_and_Health_Strategy.md) |
| ADRs | [`../architecture/adr/README.md`](../architecture/adr/README.md) |
| CI | [`../testing/CI_Quality_Gate.md`](../testing/CI_Quality_Gate.md) |
| Coverage | [`../testing/Test_Coverage_Strategy.md`](../testing/Test_Coverage_Strategy.md) |
| Contributing | [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) |

---

## 10. Known Limitations

- Public cloud deployment was explored but deferred; Docker Compose is the verified reference
- No production-grade secrets manager
- No refresh-token / rotating session lifecycle
- No centralized logging, Prometheus/Grafana, alerting, or distributed tracing
- Actuator exposes only `health` + `info` (by design)
- E2E does not destructively clean unique timestamp data
- Frontend/backend unit coverage remains low overall (critical insight/health utils are higher)
- Attention Center is scoped to the current dashboard/portfolio filter context
- PM project list has no dedicated backend list endpoint (FE uses report + id cache)
- Server-side JWT `exp` wait is not an E2E case (client `expiresAt` + invalid token are)

---

## 11. Future Improvements

Not commitments — optional next steps:

1. Managed cloud deployment (after JDBC/JWT/CORS runbook is followed on a platform)
2. Centralized observability / alerting
3. Refresh token / stronger auth lifecycle
4. Automated E2E data cleanup
5. Broader unit/component coverage + optional coverage gate
6. Production secrets manager
7. Audit logging

---

## 12. Cloud Deployment Status

Public cloud deployment deferred.  
Render preparation (Docker backend, `prod` profile, CORS env, `render.yaml`, bootstrap flag) remains in the repo.  
**Verified Docker Compose is the final reference deployment.**

Do not present a live public URL as part of this delivery.

---

## 13. Handoff Checklist

- [x] Quality gates green locally (backend 100, frontend 42, lint, build, verify)
- [x] CI Quality Gate green on latest `main` commit
- [x] Docker Compose official demo path documented and stack started healthy
- [x] Health / readiness / liveness verified
- [x] README reality-checked (no live cloud claim)
- [x] Limitations and cloud status honest
- [x] Demo credentials marked DEMO ONLY
- [x] Product Tour screenshots linked
- [x] No `.env` / `.env.docker` / `.env.e2e` committed
- [ ] Recreate GREEN/YELLOW portfolio contrast during live demo if the local volume has no Day 19 sample pair (ADMIN → PM report flow; no extra seed in source)
