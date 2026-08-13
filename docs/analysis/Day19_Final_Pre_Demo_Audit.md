# Day 19 — Final Pre-Demo Audit

**Proje:** Kolaysoft CTO Dashboard  
**Tarih:** 2026-08-13  
**Tip:** Final teknik denetim (yeni feature yok)  
**HEAD:** `0d55de2` — `docs: verify Day 19 local docker demo and smoke tests`

---

## 1. Amaç

Day 20 öncesi Full Stack MVP’nin stabil, temiz ve gösterilebilir olduğunu doğrulamak.

## 2. Git status

| Kontrol | Sonuç |
| --- | --- |
| `git status --short` | **boş** (GIT_CLEAN) |
| Branch | `main` == `origin/main` |

Anlamlı geçmiş (özet):

| Commit | Konu |
| --- | --- |
| `0d55de2` | Day19 Docker/smoke documentation |
| `dfe96e8` | Day19 CORS fix (`localhost:3000`) |
| `ef956af` / `0c7a100` | Day18 documentation |
| `a729fa7` | Docker Compose Full Stack |
| `98d0c61` / `f56e0ff` / `af0f3b8` | CI + E2E |
| `f2148f3` | Playwright E2E |
| `7a45043` | Executive Insight / Attention Center |

Uncommitted dosya: **yok**.

## 3. CI

Son `main` run (HEAD `0d55de2`):  
https://github.com/feyzasagman/kolaysoft-cto-dashboard/actions/runs/31697757478

| Job | Sonuç |
| --- | --- |
| Backend Quality | **success** |
| Frontend Quality | **success** |
| Full Stack E2E | **success** |

Not: `dfe96e8` (CORS fix) için ayrı run yok; tip commit `0d55de2` history’de CORS fix’i içerir ve CI **success**.

## 4. Backend regression

```text
./mvnw.cmd test          → Tests run: 79, Failures: 0, Errors: 0
./mvnw.cmd clean package → BUILD SUCCESS / PACKAGE_OK
```

CORS fix sonrası regression: **yok**.

## 5. CORS security

`CorsConfig` allowlist:

- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Docker nginx SPA)

Kontrol:

- Wildcard `*` origin **yok**
- `allowCredentials(true)` + explicit origins (unsafe `*` origin yok)
- Production domain açılmamış; localhost amaçları belgelenmiş

Kod değişikliği bu audit’te **yapılmadı**.

## 6. Docker restart

```bash
docker compose down
docker compose --env-file .env.docker.example up -d --build
```

| Servis | Status |
| --- | --- |
| `cto-compose-postgres` | healthy |
| `cto-compose-backend` | healthy (`java -jar /app/app.jar`) |
| `cto-compose-frontend` | up (nginx 1.27.5 + Vite dist) |

`down -v` **çalıştırılmadı**.

## 7. Persistence

- Volume `kolaysoft-cto-dashboard_postgres_data` duruyor
- Restart sonrası ADMIN login OK
- Day19/E2E demo verisi korundu (users=7, projects=2, reports=2, wi=1, risks=1)

## 8. Health / Swagger

| Endpoint | Sonuç |
| --- | --- |
| `GET :8080/api/v1/health` | 200 UP |
| `GET :3000/api/v1/health` | 200 UP (proxy) |
| Swagger UI | 200 |
| OpenAPI tags | Authentication, Users, Projects, Project Assignments, Weekly Reports, Work Items, Risks, Dashboard, Health |

## 9. ADMIN manual smoke (Playwright / Chromium → `:3000`)

| Check | Result |
| --- | --- |
| Login → dashboard | PASS |
| Users | PASS |
| Yeni Kullanıcı dialog | PASS |
| Projects + Yeni Proje | PASS |
| Project Detail + Ekip + assign UI | PASS |

## 10. PM manual smoke

Kullanıcı: `pm.d19.20260813141149@kolaysoft.com.tr` (mevcut)

| Check | Result |
| --- | --- |
| Login | PASS |
| Users nav yok | PASS |
| Reports page | PASS |
| Project Detail | PASS |
| Tabs: İş Kalemleri / Riskler / Ekip | PASS |
| Tab label “Raporlar” (kod: `Raporlar`, “Haftalık Raporlar” değil) | PASS (isim farkı) |
| `GET /projects` / yabancı id → 403 | PASS (by design) |

## 11. CTO manual smoke

Kullanıcı: `cto.d19.20260813141149@kolaysoft.com.tr`

| Check | Result |
| --- | --- |
| Login + Dashboard | PASS |
| Attention Center | PASS |
| Yeni Kullanıcı yok | PASS |
| Executive Insight (“Yönetici Özeti”) | PASS |
| Assign / Düzenle / rapor oluştur butonları yok | PASS |
| Reports tab | PASS |

## 12. Browser console / network

| Metrik | Değer |
| --- | --- |
| pageerror / React fatal | 0 |
| HTTP 500 | 0 |
| Network | 47×200, 3×403 |
| Console “Failed to load resource 403” (PM) | **harmless** — beklenen yetki reddi (`/users` PM için) |

CORS error: **yok**.

## 13. Backend logs

Smoke sonrası kritik `ERROR` / stack / SQL / Flyway / Invalid CORS / 500: **yok**.  
Secret/token loglanmıyor (görülen loglar path/status seviyesinde).

## 14. README / docs consistency

| Kaynak | CORS `:3000` / Docker / health / Swagger |
| --- | --- |
| README | Uyumlu |
| Day19 smoke / verified demo / analysis | Uyumlu |
| Docker_Compose_Local_Setup | Uyumlu |
| Technical_Decisions | Uyumlu (`5173` + `3000`) |

Day19 teslim tanımı: **Verified Local Docker Demo** (cloud production değil).  
Runtime: nginx static SPA + packaged JAR — doğrulandı.

## 15. Demo data

| İhtiyaç | Durum |
| --- | --- |
| ADMIN / CTO / PM | Var |
| ≥2 proje | Var (2) |
| Haftalık rapor / WI / risk | Var |
| GREEN sağlık | **PASS** — Project A `D19-20260813141149` → **GREEN** (70/65, gap 5) |
| YELLOW sağlık | **PASS** — Project B `E2E1786621027889` → **YELLOW** |

### YELLOW hazırlık (API / normal akış — source değişmedi)

`ReportHealthCalculator` kuralları:

- Progress gap ≥ 10 → YELLOW; ≥ 20 → RED  
- `scheduleStatus` `AT_RISK` / `YELLOW` → YELLOW  
- Açık `HIGH` risk → YELLOW; `CRITICAL` → RED  
- **BUG-002:** YELLOW/RED create/update için en az bir açık risk gerekir (create anında risk yok → önce GREEN, risk ekle, sonra update)

Uygulanan senaryo (Project B, manager `e2e-pm-1786621027889@example.test`):

1. Mevcut week-33 GREEN rapor korundu  
2. `HIGH` + `OPEN` risk eklendi  
3. Rapor güncellendi: planned **70** / actual **55** (gap **15**), `scheduleStatus=AT_RISK`  
4. Work item mevcut  

Doğrulama:

- `health-distribution`: green=1, yellow=1  
- Dashboard Project B `latestHealth=YELLOW`  
- Project A GREEN korundu  
- Attention Center: proje kodu + “Dikkat gerektiren sağlık” / “Hedefin 15 puan gerisinde”  
- Executive Insight: severity attention, −15 puan, sağlık Dikkat, 1 açık risk  

Screenshot: **OPTIONAL / DAY20 EVIDENCE** (`docs/evidence/day19/DEMO_SCREENSHOT_CHECKLIST.md`) — blocker değil.

## 16. Security

| Kontrol | Sonuç |
| --- | --- |
| `.env` / `.env.docker` / `.env.e2e` tracked | Hayır (gitignore) |
| Commit edilen | yalnız `.env*.example` |
| Demo password belgesi | DEMO ONLY |
| JWT prod | env zorunlu (dev fallback) |
| Accidental secret in recent history | Şüphe yok |

## 17. Known limitations (bug değil)

- Cloud production deployment yok  
- Production monitoring / audit log yok  
- Refresh token yok  
- Frontend unit test yok  
- Real server-side JWT expiry long-wait E2E yok  
- E2E cleanup yok  
- PM `GET /api/v1/projects` 403 (by design)

## 18. Day20 readiness

| Madde | Sonuç |
| --- | --- |
| MVP stable | PASS |
| Bilinen açık MVP bug | PASS (0) |
| Functional gap (MVP kritik) | PASS (0) |
| README complete | PASS |
| Technical Decisions | PASS |
| Day18 demo scenario | PASS |
| Day19 smoke report | PASS |
| Docker demo works | PASS |
| CI green (HEAD) | PASS |
| E2E green (CI + local Docker smoke) | PASS |
| Git clean | PASS |
| Demo data usable | **PASS** (GREEN + YELLOW) |
| Known limitations documented | PASS |

## 19. Açık aksiyonlar

1. ~~YELLOW demo data~~ → **kapatıldı** (API ile Project B).  
2. **Evidence screenshots:** OPTIONAL / DAY20 EVIDENCE — blocker değil.

Yeni bug: **0**. Blocker: **0**.

## 20. Final karar

**A) DAY 19 FULLY VERIFIED — READY FOR DAY 20**

Verified Local Docker Demo + GREEN/YELLOW portföy farkı + CI/smoke/CORS doğrulanmış.
