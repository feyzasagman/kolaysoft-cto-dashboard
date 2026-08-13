# Day 19 — Verified Local Docker Demo

**Tür:** Doğrulanmış lokal Docker demo (cloud production deployment değildir)

## 1. Amaç

PostgreSQL + Spring Boot + React/nginx stack’inin birlikte ayağa kalktığını; env, CORS, Flyway, seed, health, smoke ve log kontrolleriyle kanıtlamak.

## 2. Ortam

| Öğe | Değer |
| --- | --- |
| Host OS | Windows 10 + Docker Desktop |
| Compose project | `kolaysoft-cto-dashboard` |
| Env file | `.env.docker.example` (DEMO/LOCAL) |
| Profile | `dev` (seed ADMIN) |

## 3. Servis mimarisi

```text
Browser :3000
   → nginx (SPA + /api proxy)
        → backend:8080 (Spring Boot JAR)
             → postgres:5432 (volume postgres_data)
```

## 4. Startup command

```bash
docker compose --env-file .env.docker.example up -d --build
```

Sıra: postgres (healthy) → backend (Flyway + health) → frontend.

## 5. Service status (doğrulandı)

| Container | Status |
| --- | --- |
| `cto-compose-postgres` | Up (healthy) `:5432` |
| `cto-compose-backend` | Up (healthy) `:8080` |
| `cto-compose-frontend` | Up `:3000→80` |

## 6. PostgreSQL

- Image: `postgres:16-alpine`
- DB: `cto_dashboard`
- Volume: `kolaysoft-cto-dashboard_postgres_data`
- Health: `pg_isready`

## 7. Flyway

- Location: classpath migration V1
- Log: validated 1 migration; schema version 1; up to date
- Table: `flyway_schema_history` present
- Hibernate: `ddl-auto=validate` (startup başarılı)

## 8. Backend

- Runtime: `java -jar /app/app.jar` (multi-stage Docker, JRE 21)
- Health: `http://localhost:8080/api/v1/health` → 200 UP
- Swagger: `http://localhost:8080/swagger-ui/index.html` → 200

## 9. Frontend / nginx

- Production Vite build → nginx 1.27 static
- UI: `http://localhost:3000` → 200
- **Dev server production gibi sunulmaz**

## 10. API proxy

- `http://localhost:3000/api/v1/health` → 200
- Browser `backend` hostname kullanmaz

## 11. CORS

- Vite: `http://localhost:5173`
- Docker SPA Origin: `http://localhost:3000` (nginx Origin’i Spring’e iletir)
- Day 19: allowlist her iki origin’i de içerir (aksi halde Invalid CORS request)

## 12. Environment

Compose → backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SPRING_PROFILES_ACTIVE=dev`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `SERVER_PORT=8080`  
Frontend build-arg: `VITE_API_BASE_URL=/api/v1`  
Gerçek secret commit edilmez; `.env.docker.example` DEMO/LOCAL.

## 13. Demo users

| Rol | Kaynak | Credential |
| --- | --- | --- |
| ADMIN | `DevDataInitializer` (`dev`) | `admin@kolaysoft.com.tr` / `Admin123!` — DEMO ONLY |
| PM / CTO | Seed yok | ADMIN UI/API ile oluşturulur |

Production’da varsayılan parola kullanılmamalıdır.

## 14. Smoke test

Ayrıntı: [`docs/testing/Day19_Docker_Smoke_Test_Report.md`](../testing/Day19_Docker_Smoke_Test_Report.md)

- API smoke: ADMIN / PM / CTO (nginx proxy)
- UI smoke: Playwright **7/7** against `http://localhost:3000`

## 15. Persistence

`docker compose down` → `up -d` ( **-v yok** ): volume ve Day19 demo proje/kullanıcı verisi korundu; login + project GET 200.

## 16. Logs

Startup: Hikari + Flyway + Tomcat 8080 + Started.  
Smoke sonrası kontrolsüz ERROR/500 yok.  
Beklenen 401/403 business/security yanıtları hata sayılmaz.

## 17. CI evidence

Workflow: `.github/workflows/ci.yml` — CI Quality Gate  
`main` son completed run’lar: **success**  
Örnek: https://github.com/feyzasagman/kolaysoft-cto-dashboard/actions/runs/31633939067

## 18. Known limitations

- Cloud/production deployment yok
- Monitoring / audit log yok
- Demo JWT/DB secret’ları yalnız local
- PM `GET /api/v1/projects` 403 (by design; FE alternatif yollar)
- `docs/evidence/day19/` screenshot dosyaları opsiyonel (otomatik üretilmedi)

## 19. Runbook

```bash
# Start
docker compose --env-file .env.docker.example up -d --build

# Status
docker compose ps

# Logs
docker compose logs -f backend

# Stop (keep data)
docker compose down

# Reset DB (DESTRUCTIVE)
# docker compose down -v
```

## 20. Day20 readiness

Hazır olması gerekenler:

- [x] Çalışan Docker stack
- [x] Demo credentials
- [x] Demo veri (smoke ile oluşturulabilir)
- [x] README
- [x] Day18 demo scenario
- [x] Day19 smoke result
- [x] Git history
- [x] CI PASS (`main`)
- [x] Backend/FE test sonuçları (önceki günler + Day19 regression)
