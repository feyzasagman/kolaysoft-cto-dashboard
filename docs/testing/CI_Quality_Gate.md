# CI Quality Gate

## 1. CI amacı

Her `push` / `pull_request` (`main`) sonrasında Full Stack MVP’nin regressiyonunu otomatik yakalamak:

- Backend unit/controller/service testleri + package
- Frontend lint + production build
- Temiz PostgreSQL + Flyway + Spring Boot + React + Playwright E2E

Amaç yalnızca yeşil tik değil; gerçek kırılmada pipeline’ın fail etmesidir.

Workflow: `.github/workflows/ci.yml` — **CI Quality Gate**

## 2. Workflow trigger’ları

| Olay | Dal |
|---|---|
| `push` | `main` |
| `pull_request` | `main` |
| `workflow_dispatch` | manuel |

`concurrency`: aynı ref’te yeni run eskiyi iptal eder.

`permissions.contents: read` — yazma yetkisi yok.

## 3. Backend Quality job

Runner: `ubuntu-latest`

1. checkout  
2. Java 21 (Temurin) + Maven cache  
3. `chmod +x mvnw`  
4. `./mvnw -B clean verify` — tests + package + **JaCoCo** HTML  
5. Upload artifact `backend-jacoco-report` (`target/site/jacoco/`, retention 7 gün)

Beklenen: güncel test seti (ör. 79) PASS, verify SUCCESS. Coverage threshold zorunlu değildir.

Ayrıntı: [`Test_Coverage_Strategy.md`](Test_Coverage_Strategy.md)

## 4. Frontend Quality job

1. checkout  
2. Node 20 + npm cache  
3. `npm ci` (`package-lock.json`)  
4. `npm run lint`  
5. `npm run test:coverage` (Vitest + RTL + V8; `test:run` ile çift koşu yok)  
6. Upload artifact `frontend-coverage-report` (`coverage/`, retention 7 gün)  
7. `npm run build`

Lint error fail eder; yalnızca warning ile fail etmez (ESLint exit code).  
Unit test fail → Frontend Quality fail. Coverage threshold bu adımda zorunlu değildir.

Ayrıntı: [`Frontend_Unit_Test_Strategy.md`](Frontend_Unit_Test_Strategy.md) · [`Test_Coverage_Strategy.md`](Test_Coverage_Strategy.md)

## 5. PostgreSQL service

Yalnız **Full Stack E2E** job’ında service container:

| Alan | CI değeri |
|---|---|
| Image | `postgres:16-alpine` |
| DB | `cto_dashboard_ci` |
| User | `postgres` |
| Password | CI-only (`ci_postgres_only_not_prod`) |
| Port | `5432` |
| Health | `pg_isready` |

Production / local Docker şifresi kullanılmaz. Her run boş DB ile başlar.

## 6. Flyway clean DB doğrulaması

Backend `SPRING_PROFILES_ACTIVE=dev` + `DB_URL=.../cto_dashboard_ci` ile ayağa kalkar:

- Flyway V1 boş şemaya uygulanır  
- `flyway_schema_history` oluşur  
- Hibernate `ddl-auto=validate` geçer  

Baseline / eski DB’ye bağlanma / reset scripti yok.

## 7. E2E mimarisi

`needs: [backend-quality, frontend-quality]`

Sıra:

1. PostgreSQL healthy  
2. `./mvnw clean package -DskipTests` (testler Backend Quality’de)  
3. JAR background start → log: `backend-ci.log`  
4. `GET /api/v1/health` poll (2s aralık, max ~3 dk)  
5. `npm ci` + `npm run build`  
6. `npx playwright install --with-deps chromium`  
7. `npm run test:e2e`  

Frontend CI’da Playwright `webServer` → `vite preview` (port 5173). Lokal hâlâ `npm run dev`.

Seed: `DevDataInitializer` (`dev` profil) ADMIN üretir. CTO’yu admin-workflow oluşturur. Auth bypass yok.

## 8. Environment / secrets

| Değişken | Kaynak |
|---|---|
| `DB_*` | Workflow env (CI DB) |
| `JWT_SECRET` | CI-only uzun test secret (prod secret değil) |
| `E2E_ADMIN_*` | Dev seed ile uyumlu; repo’ya `.env.e2e` commit edilmez |
| `E2E_CTO_*` | Boş → suite CTO üretir |
| `VITE_API_BASE_URL` | Build-time API adresi |

GitHub Secrets zorunlu değil (yalnızca CI/demo credential). İleride prod benzeri secret isterseniz Actions Secrets’a taşıyın; log’a yazmayın.

## 9. Failure artifacts

E2E fail ise (7 gün retention):

- `frontend/playwright-report/`  
- `frontend/test-results/` (trace/screenshot/video)  
- `backend/cto-dashboard-api/backend-ci.log`  

Başarılı run’da ağır artifact yüklenmez.

## 10. Lokal ve CI farkları

| | Lokal | CI |
|---|---|---|
| Postgres | `cto-dashboard-postgres` / `cto_dashboard` | Service / `cto_dashboard_ci` |
| FE sunucu | Vite `dev` | `build` + `preview` |
| E2E env | `frontend/.env.e2e` | Workflow `env` |
| Backend test | Elle / aynı komutlar | Backend Quality job |

Lokal E2E için Postgres + backend ayakta olmalı (`docs/testing/Automated_E2E_Test_Strategy.md`).

## 11. Branch protection önerisi

Repository Settings → Branch protection (`main`) için required checks:

1. **Backend Quality**  
2. **Frontend Quality**  
3. **Full Stack E2E**  

Workflow branch protection’ı değiştirmez; elle açılır.

## 12. Troubleshooting

| Belirti | Kontrol |
|---|---|
| Backend health timeout | Artifact `backend-ci.log`, Flyway/DB env |
| E2E login fail | `E2E_ADMIN_PASSWORD` = seed `Admin123!`, `dev` profil |
| Preview / port | `E2E_BASE_URL` = `http://127.0.0.1:5173` |
| Playwright browser | `npx playwright install --with-deps chromium` |
| npm ci fail | `package-lock.json` commit edilmiş mi |

Gerçek GitHub runner sonucu, workflow `main`’e push / PR açılana kadar **PENDING** sayılır.
