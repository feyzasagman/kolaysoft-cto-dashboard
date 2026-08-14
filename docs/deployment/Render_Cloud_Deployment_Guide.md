# Render Cloud Deployment Guide

**Scope:** Portfolio / stage demo on Render.  
**Not** production-grade hosting, HA, or enterprise monitoring.

Local Vite, Docker Compose, Playwright E2E and GitHub Actions remain the primary verified paths.

---

## 1. Architecture

```text
Browser (HTTPS)
   → Render Static Site (React SPA)
        → HTTPS REST → Render Web Service (Spring Boot, Docker, prod profile)
             → Render PostgreSQL
```

- Frontend calls the **public** backend URL (`VITE_API_BASE_URL`).
- Local Docker nginx reverse proxy is **not** required on Render.
- Do not activate Spring profile `dev` on the public host.

---

## 2. Render services

| Service | Type | Source |
| --- | --- | --- |
| `cto-dashboard-api` | Web Service (Docker) | `backend/cto-dashboard-api/Dockerfile` |
| `cto-dashboard-web` | Static Site | `frontend/` → `npm ci && npm run build` → `dist` |
| `cto-dashboard-db` | PostgreSQL | Render managed |

Blueprint file: [`render.yaml`](../../render.yaml) (env placeholders only; no secrets).

---

## 3. PostgreSQL creation

1. Create a Render PostgreSQL instance (Blueprint DB or Dashboard).
2. From the DB info panel, map credentials into **explicit JDBC** variables (preferred):

| App env | Value shape |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://HOST:PORT/DATABASE` |
| `DB_USERNAME` | Render DB user |
| `DB_PASSWORD` | Render DB password |

**Note:** Render’s internal `DATABASE_URL` / `postgres://…` form is **not** auto-parsed by this app. Convert to JDBC yourself. Do not commit real values.

On first boot (empty DB), Flyway runs `V1__init_schema.sql` (`ddl-auto=validate`).

---

## 4. Backend environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | Yes | Must be `prod` |
| `DB_URL` | Yes | JDBC URL |
| `DB_USERNAME` | Yes | |
| `DB_PASSWORD` | Yes | |
| `JWT_SECRET` | Yes | Long random; **no** dev fallback under `prod` |
| `JWT_EXPIRATION_MS` | No | Default `3600000` |
| `CORS_ALLOWED_ORIGINS` | Yes (cloud) | Comma-separated exact origins (frontend HTTPS URL). Never `*` |
| `PORT` | Platform | Injected by Render; Spring binds via `server.port` |
| `SERVER_PORT` | No | Local/Docker default path still works |
| `SPRINGDOC_ENABLED` | No | Default `false` in prod |
| `APP_DEMO_BOOTSTRAP_ENABLED` | No | Default `false`; one-time only |
| `DEMO_ADMIN_EMAIL` | If bootstrap | |
| `DEMO_ADMIN_PASSWORD` | If bootstrap | Min 12 chars |
| `DEMO_ADMIN_FIRST_NAME` / `DEMO_ADMIN_LAST_NAME` | No | Defaults `Demo` / `Admin` |

Health: `/actuator/health/readiness` (also `/actuator/health`, `/api/v1/health`).

---

## 5. Frontend build variables

| Variable | When | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | **Build time** (Static Site) | `https://cto-dashboard-api.onrender.com/api/v1` |

See [`frontend/.env.cloud.example`](../../frontend/.env.cloud.example).

| Environment | Typical value |
| --- | --- |
| Local Vite | `http://localhost:8080/api/v1` |
| Docker Compose | `/api/v1` (nginx proxy) |
| Render Static | `https://<backend>/api/v1` |

Do not hard-code the final Render hostname in source.

---

## 6. CORS

Backend reads:

`CORS_ALLOWED_ORIGINS=https://cto-dashboard-web.onrender.com`

Defaults (when unset): `http://localhost:5173,http://localhost:3000` — local workflows unchanged.

Rules:

- Exact origins only
- No `*`
- `allowCredentials=true` remains; wildcard forbidden in code

After you know the Static Site URL, set CORS and **redeploy backend**.

---

## 7. JWT

`application-prod.yml` has **no** development fallback. Missing/blank `JWT_SECRET` → startup failure.

Generate a strong secret (run locally; do not commit or paste into chat logs):

```bash
# OpenSSL (64 random bytes → Base64; keep as a SINGLE line)
openssl rand -base64 64 | tr -d '\n'

# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Set as Render secret `JWT_SECRET`.

Startup logs **must not** print the secret. You should see only:

`JWT HMAC key configured: present=true, source=base64|utf8, byteLength=N, bits=...`

JJWT HMAC requires >= 256 bits. The API no longer blindly Base64-decodes a secret that would become a weak key (that used to crash `JwtService` construction).

You do **not** need to rotate `JWT_SECRET` after this fix unless the value is shorter than 32 characters.

---

## 8. Demo ADMIN bootstrap

`DevDataInitializer` (`@Profile("dev")`) must **not** run on Render.

**Recommended approach (implemented):** opt-in `DemoBootstrapInitializer`

1. Deploy backend with DB + `JWT_SECRET` + CORS (bootstrap still `false` first is OK if you prefer SQL — see below).
2. For first ADMIN create, set:

   - `APP_DEMO_BOOTSTRAP_ENABLED=true`
   - `DEMO_ADMIN_EMAIL=<your demo email>`
   - `DEMO_ADMIN_PASSWORD=<strong password ≥12 chars>`

3. Redeploy once → roles + ADMIN created if email missing.
4. Immediately set `APP_DEMO_BOOTSTRAP_ENABLED=false` and clear password env if desired.
5. Log in via UI; create synthetic demo projects/reports (no real PII).

**Not used:** unauthenticated setup endpoint; auto-`Admin123!` on every prod start.

**Alternative (manual SQL):** generate a BCrypt hash offline and `INSERT` into `roles` / `users` via Render DB shell. Same safety goal; more operator steps.

---

## 9. Health check

Render Web Service:

- Path: `/actuator/health/readiness`
- Expect: HTTP 200, `{"status":"UP"}`

Also available:

- `/actuator/health`
- `/actuator/health/liveness`
- `/api/v1/health` (application envelope; backward compatible)

Sensitive Actuator endpoints (`env`, `beans`, …) stay closed.

---

## 10. SPA routing

Static Site rewrite (Blueprint + Dashboard equivalent):

```text
/*  →  /index.html
```

Configured in `render.yaml` `routes`. Prevents React Router refresh 404s.

---

## 11. Deployment order

1. Create / link PostgreSQL  
2. Configure backend env (`prod`, JDBC, JWT, CORS)  
3. Deploy backend → wait until readiness healthy  
4. One-time demo ADMIN bootstrap (then disable)  
5. Set `VITE_API_BASE_URL` → deploy Static Site  
6. Confirm CORS includes frontend origin  
7. Smoke test (below)

---

## 12. Smoke test

1. Open frontend HTTPS URL → login page  
2. Login with demo ADMIN  
3. Create a synthetic project (ADMIN)  
4. Open Dashboard / Project Detail  
5. `GET https://<backend>/actuator/health/readiness` → UP  
6. Confirm browser network calls go to `VITE_API_BASE_URL` (not localhost)

---

## 13. Security notes

- HTTPS terminated by Render  
- JWT secret and DB credentials: **backend env only**  
- No secrets in frontend bundle (only public API base URL)  
- No `dev` profile / `DevDataInitializer` on public host  
- Actuator exposure remains `health,info`  
- Portfolio demo passwords are still sensitive — rotate and avoid reusing local `Admin123!`

---

## 14. Free / demo limitations

- Cold starts / spin-down on free tiers  
- No SLA, no HA, no multi-region  
- No centralized logging / Prometheus / alerting  
- Disk/DB limits on free Postgres  
- Public demo data only (synthetic)  
- Not a claim of “production ready” hosting

---

## 15. Rollback / redeploy

- Redeploy previous successful Render deploy from Dashboard  
- Or push a known-good git commit and trigger Blueprint/auto-deploy  
- DB: Flyway migrations are forward-only; avoid destructive schema experiments on the shared demo DB  
- Emergency: disable public services; rotate `JWT_SECRET` (invalidates sessions) and `DEMO_ADMIN_PASSWORD`

---

## 16. Troubleshooting

| Symptom | Check |
| --- | --- |
| Backend won’t start | `JWT_SECRET`, `DB_*`, `SPRING_PROFILES_ACTIVE=prod`, Flyway logs |
| JwtService constructor / WeakKeyException | Redeploy this fix; confirm startup log `JWT HMAC key configured` (never log the secret). Secret must be >= 32 characters |
| JDBC errors | URL must be `jdbc:postgresql://…` not `postgres://…` |
| CORS / login blocked | `CORS_ALLOWED_ORIGINS` exact match to Static Site origin (https, no trailing slash mismatch) |
| FE calls localhost | Rebuild Static Site after setting `VITE_API_BASE_URL` |
| Refresh 404 on deep route | SPA rewrite `/* → /index.html` |
| No admin user | Enable one-time demo bootstrap or insert via SQL; confirm not using `dev` seed |
| Healthcheck fail | Path `/actuator/health/readiness`; service up; DB reachable |
| Port bind issues | Rely on Render `PORT`; app maps `server.port=${PORT:${SERVER_PORT:8080}}` |

---

## Local regression reminder

Cloud prep must not break:

```bash
# Backend
cd backend/cto-dashboard-api && ./mvnw.cmd test && ./mvnw.cmd clean verify

# Frontend
cd frontend && npm run lint && npm run test:run && npm run build

# Compose
docker compose config
```

---

## Deployment Attempt Status

**Status:** public cloud deployment **deferred**. This is not a product bug and not a failed internship delivery.

What completed:

- Infrastructure preparation (`render.yaml`, `prod` profile, CORS env, platform `PORT`, JDBC-only `DB_URL`, safe Actuator, JWT key factory)
- Render PostgreSQL was provisioned (operator-side)
- Backend Docker deploy was **attempted**
- JWT / DB URL / env issues were debugged (including weak accidental-Base64 HMAC keys and non-JDBC `postgres://` URLs)

What is **not** claimed:

- Live public URL
- Production deployed
- Render verified as the official demo

**Final verified demo environment remains Docker Compose** (`docker compose --env-file .env.docker.example up --build`).

Do not commit or paste Render hostnames, JWT secrets, or database passwords in this document.