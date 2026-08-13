# Day 19 — Docker Smoke Test Report

**Proje:** Kolaysoft CTO Dashboard  
**Ortam:** Doğrulanmış lokal Docker Compose (production cloud değil)  
**Tarih:** 2026-08-13  
**Stack:** `cto-compose-postgres` · `cto-compose-backend` · `cto-compose-frontend`

## Özet

| Sonuç | Adet |
| --- | ---: |
| PASS | 20 |
| FAIL | 0 |
| BLOCKED | 0 |
| NOT_TESTED | 0 |

**Karar:** Day 19 verified local Docker demo — PASS (CORS `:3000` allowlist düzeltmesi sonrası)

---

## Matris

| Test ID | Layer | Scenario | Expected | Actual | Result | Evidence/Note |
| --- | --- | --- | --- | --- | --- | --- |
| D19-001 | Compose | `docker compose --env-file .env.docker.example config` | Valid config | OK | PASS | Root compose |
| D19-002 | PostgreSQL | Container health + DB | healthy, `cto_dashboard` | healthy; volume `kolaysoft-cto-dashboard_postgres_data` | PASS | `docker compose ps`, `psql \dt` |
| D19-003 | Backend | Startup JAR on :8080 | Started + healthy | Tomcat 8080, healthcheck pass | PASS | Logs: Started CtoDashboardApiApplication |
| D19-004 | Flyway | V1 schema | validated / up to date | `Successfully validated 1 migration`; schema v1; `flyway_schema_history` | PASS | Backend logs + SQL |
| D19-005 | Backend | `GET /api/v1/health` | HTTP 200 UP | 200, `status=UP` | PASS | Direct `:8080` |
| D19-006 | Backend | Swagger UI | HTTP 200 | 200; OpenAPI tags: Authentication, Users, Projects, Project Assignments, Weekly Reports, Work Items, Risks, Dashboard, Health | PASS | `/swagger-ui/index.html`, `/v3/api-docs` |
| D19-007 | Frontend | `GET http://localhost:3000/` | HTTP 200 SPA | 200, `index.html` + `#root` | PASS | nginx 1.27 + Vite dist |
| D19-008 | nginx | `GET http://localhost:3000/api/v1/health` | HTTP 200 via proxy | 200 UP | PASS | Browser→nginx→backend:8080 |
| D19-009 | Auth UI | ADMIN login via `:3000` | Dashboard | Login 200 → `/dashboard` | PASS | Playwright probe + E2E; CORS fix required first |
| D19-010 | UI | Dashboard | Loads, no fatal | KPI/summary/portfolio 200 | PASS | Browser network after login |
| D19-011 | UI/API | Projects | List/detail | ADMIN projects 200; create 201 | PASS | API + Playwright admin |
| D19-012 | UI | Project Detail | Opens | Detail + tabs | PASS | Playwright admin/cto |
| D19-013 | PM | Login → report → WI → risk | Mutations OK | Report/WI/risk 201; assignments 200 | PASS | API smoke + Playwright PM  (note: `GET /projects` PM için 403 by design) |
| D19-014 | CTO | Dashboard / Attention / Insight / read-only | Read OK; mutate 403 | Dashboard 200; mutation 403; UI “Yönetici Özeti” + Attention | PASS | API + Playwright CTO |
| D19-015 | CORS | Docker Origin `:3000` | Login not blocked | Initially `Invalid CORS request`; after allowlist `:3000` → PASS | PASS | Root cause + fix in `CorsConfig` |
| D19-016 | Env | Compose ↔ application | DB/JWT/profile/port match | Container env matches `.env.docker.example` / compose | PASS | `docker exec printenv` (demo secrets) |
| D19-017 | Persistence | `down` then `up` (no `-v`) | Volume + data kept | Project/users/reports retained; login 200 | PASS | Volume preserved |
| D19-018 | Logs | Backend ERROR/500 during smoke | No uncontrolled 500 | No ERROR/Exception/CORS after fix | PASS | `docker compose logs backend` |
| D19-019 | Browser/network | Login/dashboard/projects 200; no React fatal | 200s | Playwright Docker FE **7/7**; network 200s | PASS | E2E against `http://localhost:3000` |
| D19-020 | CI | GitHub Actions Quality Gate on `main` | success | Latest completed runs `conclusion=success` | PASS | e.g. https://github.com/feyzasagman/kolaysoft-cto-dashboard/actions/runs/31633939067 |

---

## CORS notu (Day 19 bulgusu)

Docker SPA `VITE_API_BASE_URL=/api/v1` (same-origin) kullanır; ancak browser `Origin: http://localhost:3000` gönderir ve nginx bunu Spring’e iletir. Allowlist yalnız `:5173` iken login **403 Invalid CORS request** olur.

**Düzeltme:** `CorsConfig` → `http://localhost:5173` + `http://localhost:3000`.

---

## Kanıt ekranları (kullanıcı / opsiyonel)

Klasör: `docs/evidence/day19/` (screenshot dosyası commit edilmediyse buraya eklenebilir)

1. `docker compose ps`
2. Frontend login (`:3000`)
3. Dashboard
4. Project Detail
5. Swagger
6. GitHub Actions green run
7. Backend health JSON

---

## Komut özeti

```bash
docker compose --env-file .env.docker.example config
docker compose --env-file .env.docker.example up -d --build
# FE Playwright (Docker UI):
# E2E_BASE_URL=http://localhost:3000 E2E_API_BASE_URL=http://localhost:3000/api/v1 npm run test:e2e
```

**Yapılmadı:** `docker compose down -v` (volume korunur).
