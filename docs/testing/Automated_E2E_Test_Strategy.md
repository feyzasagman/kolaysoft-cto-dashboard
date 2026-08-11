# Automated E2E Test Strategy

## 1. Amaç

Stabil MVP’nin kritik Full Stack kullanıcı yolculuğunu Playwright ile otomatik doğrulamak.

Tek komut hedefi:

`ADMIN → kullanıcı → proje → assignment → PM → rapor → CTO → dashboard/detail`

Bu çalışma yeni ürün özelliği değildir; regression güvenlik ağıdır.

## 2. Neden Playwright

- Modern, aktif bakımlı, TypeScript-first
- Auto-wait + role/label selector desteği (erişilebilirlik dostu)
- Failure’da screenshot / trace / video
- Proje bağımlılıkları ile sıralı journey (`admin` → `pm` → `cto`)
- Cypress eklenmedi (tek runner)

## 3. Test edilen kritik kullanıcı yolculuğu

| Spec | Kapsam |
|---|---|
| `e2e/auth.spec.ts` | ADMIN login, protected route, logout, invalid credentials, client session expiry, invalid JWT → login |
| `e2e/admin-workflow.spec.ts` | PM/CTO/teammate oluşturma, proje + manager, team assignment, journey state yazma |
| `e2e/pm-workflow.spec.ts` | PM login, detail erişimi, admin UI yok, haftalık rapor, detail yansıması |
| `e2e/cto-workflow.spec.ts` | Dashboard, proje görünürlüğü, team read-only, Executive Insight, mutation UI yok |

## 4. Test data stratejisi

- Demo seed’e bağımlı sabit proje adı kullanılmaz.
- Timestamp tabanlı unique veri: `E2E-PROJ-<ts>`, `e2e-pm-<ts>@example.test`
- Admin workflow `e2e/.runtime/journey-state.json` yazar; PM/CTO okur.
- Production cleanup endpoint’i yok → destructive wipe eklenmedi.
- Test kullanıcıları DB’de kalabilir (tekrar çalıştırılabilir; unique email).

## 5. Environment variables

`frontend/.env.e2e.example` → `frontend/.env.e2e` (gitignore)

| Değişken | Açıklama |
|---|---|
| `E2E_BASE_URL` | FE URL (default `http://localhost:5173`) |
| `E2E_API_BASE_URL` | API (dokümantasyon / gelecekteki API helper) |
| `E2E_ADMIN_EMAIL` | Dev seed admin |
| `E2E_ADMIN_PASSWORD` | Zorunlu — hard-code yok |
| `E2E_CTO_EMAIL` / `E2E_CTO_PASSWORD` | Opsiyonel sabit CTO; yoksa suite CTO üretir |

## 6. Çalıştırma

Önkoşul: PostgreSQL + backend (`dev` profile) ayakta.

```powershell
cd frontend
copy .env.e2e.example .env.e2e
# E2E_ADMIN_PASSWORD doldur
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:report
```

`playwright.config.ts` Vite’i `webServer` ile başlatır (`reuseExistingServer` local’de açık).

## 7. Failure artifacts

Config:

- `screenshot: only-on-failure`
- `trace: retain-on-failure`
- `video: retain-on-failure`

Çıktı klasörleri gitignore’da: `test-results/`, `playwright-report/`, `e2e/.runtime/`

## 8. Flaky test önlemleri

- `waitForTimeout` / rastgele sleep yok
- Playwright auto-wait + `expect(...).toBeVisible()`
- `workers: 1`, journey `dependencies` ile sıralı
- Role/label selector; CSS hiyerarşisine bağlanmama
- Attention Center için “zorla listede olsun” assert yok

## 9. Security yaklaşımı

- Hard-coded password yok (env)
- Test-only auth bypass yok
- Backend security’yi E2E’de tekrar etmiyoruz; UI rol sınırları doğrulanır
- PM: Kullanıcılar / Kontrol Paneli / Yeni Proje yok
- CTO: Düzenle / rapor oluştur / kullanıcı ata / Yeni Kullanıcı yok

## 10. Mevcut sınırlamalar

### Expired JWT (server-side)

Backend JWT `expiration-ms` tipik olarak 1 saat. Gerçek imzalı JWT’nin `exp` claim’inin dolmasını beklemek E2E için pratik değil.

Token üretimini hackleme (secret ile sahte JWT) bilinçli olarak yapılmıyor.

**Otomatik test edilenler:**

1. Client contract: login `expiresIn` → `cto_token_expires_at`; geçmiş değerde reload → `/login`
2. Geçersiz bearer token → API 401 → interceptor logout → `/login`

**NOT_TESTED kalan:** Saatlerce bekleyerek gerçek JWT `exp` dolumu (CI maliyeti yüksek).

### PM proje listesi

Backend’de PM’e özel list endpoint yok; FE `localStorage` + raporlardan id toplar. PM journey önce `/projects/{id}` ile detail açar, rapor için `?projectId=` kullanır.

### Attention Center

Deterministik UI skoruna göre liste dolabilir/boş kalabilir. Journey’de güncel rapor + küçük progress gap ile listedeki varlık zorunlu assert edilmez.

### Team assign candidate page size

Assign dialog `GET /users?size=100` kullanır. Çok büyük kullanıcı tablolarında yeni teammate listede görünmeyebilir.

### Cleanup

Güvenli production-grade delete cascade yok; test kayıtları birikir.
