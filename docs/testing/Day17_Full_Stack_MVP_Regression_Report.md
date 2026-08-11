# Day 17 — Full Stack MVP Regression Report

| Bilgi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Tarih | 10 Ağustos 2026 |
| Kapsam | Day 16 sonrası full-stack MVP regression + E2E retest |
| Kural | Yeni feature / redesign / business-logic değişikliği yok — yalnız test ve rapor |
| Karar | **B) MVP STABLE WITH GAPS** (ilk regression) → Gap completion sonrası: **A) MVP STABLE** — bkz. [`Day17_Admin_Project_Assignment_Gaps_Completion.md`](../analysis/Day17_Admin_Project_Assignment_Gaps_Completion.md) |

Ham sonuçlar: [`Day17_results.csv`](Day17_results.csv) · [`Day17_results_raw.json`](Day17_results_raw.json) · koşu scripti: [`day17_e2e.ps1`](day17_e2e.ps1)

---

## 1. Amaç

Day 16’da düzeltilen **BUG-001 / BUG-002 / BUG-003** sonrası kritik Full Stack MVP akışını ADMIN, PROJECT_MANAGER ve CTO rolleriyle yeniden çalıştırmak; regression matrisi üretmek; feature yerine **GAP** sınıflandırması yapmak; Day 18 dokümantasyon geçişine hazırlık kararını vermek.

Kaynaklar:

- `docs/testing/Day15_MVP_Test_Report.md`
- `docs/testing/Day15_Bug_List.md`
- `docs/testing/Day16_Bug_Fix_and_Retest_Report.md`
- `README.md`, Swagger, mevcut frontend routes

---

## 2. Test ortamı

| Bileşen | Durum |
|---|---|
| PostgreSQL Docker | `cto-dashboard-postgres` · **Up** |
| Flyway | Schema up to date (önceki Day15/16 baseline ile uyumlu) |
| Hibernate | `ddl-auto=validate` · backend ayakta |
| Backend | `http://localhost:8080` · Spring Boot 3.5.16 · profile `dev` |
| Frontend | `http://localhost:5173` · Vite dev |
| Health | `GET /api/v1/health` → **200** |
| Swagger | `http://localhost:8080/swagger-ui/index.html` → **200** |
| Seed ADMIN | `admin@kolaysoft.com.tr` / `Admin123!` |

Day17 test verisi (API ile oluşturuldu, silinmedi):

| Tür | Örnek |
|---|---|
| PM | `day17c.pm.<ts>@kolaysoft.com.tr` |
| CTO | `day17c.cto.<ts>@kolaysoft.com.tr` |
| Proje | `D17C-<ts>` (id=9) + other PM projesi |
| Rapor | week 41 (id=9), week 45 unhealthy-with-risk |
| WI / Risk | Day17 WI + LOW/MEDIUM/HIGH/CRITICAL riskler |

---

## 3. Day16 fix doğrulaması

| Bug | Otomasyon | Canlı API | Sonuç |
|---|---|---|---|
| **BUG-001** duplicate 409 mesajı | `WeeklyReportServiceImplTest.shouldRejectDuplicateWeekWithContractMessage` + controller | `POST /reports` duplicate → **409** · mesaj: `Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.` | **PASS** |
| **BUG-002** unhealthy without open risk | `WeeklyReportServiceImplTest` + `ReportHealthCalculatorTest` | DELAYED create risksiz → **400** `BUSINESS_RULE`; açık risk sonrası DELAYED update → **200** | **PASS** |
| **BUG-003** empty path PUT 500 | `WorkItemControllerTest` / `RiskIssueControllerTest` | `PUT /work-items/` ve `PUT /risks/` → **404** `NOT_FOUND` (500 değil) | **PASS** |

`./mvnw test` → **64** test, **0** fail (Day16 suite dahil).

---

## 4. Backend regression

| Komut | Sonuç |
|---|---|
| `./mvnw test` | **BUILD SUCCESS** |
| Tests run | **64** |
| Failures | **0** |
| Errors | **0** |
| Skipped | **0** |
| `./mvnw clean package -DskipTests` | **BUILD SUCCESS** (jar repackage OK) |

---

## 5. Frontend regression

| Komut | Sonuç |
|---|---|
| `npm run build` | **PASS** (`tsc` + `vite build`) |
| `npm run lint` | **PASS** (0 error) |

Kritik ekran SPA shell (dev server, HTTP 200 — auth sonrası içerik API E2E ile doğrulandı):

| Ekran | Route | Sonuç |
|---|---|---|
| Login | `/login` | PASS |
| Dashboard | `/dashboard` | PASS (shell; ADMIN/CTO içerik API) |
| Projects | `/projects` | PASS |
| Project Detail | `/projects/:id` | PASS (API + route koruması) |
| Weekly Reports | `/reports` | PASS |
| Weekly Report Create | `/reports/new` | PASS (shell) |
| Weekly Report Detail | `/reports/:id` | PASS (API) |
| Work Items | rapor detay paneli (`WorkItemList`) — ayrı route yok | PASS (API + UI bileşen mevcut) |
| Risks | rapor detay paneli (`RiskIssueList`) — ayrı route yok | PASS |
| Users | `/users` | PASS (liste; create UI yok → GAP-001) · **GAP-001 RESOLVED** (gap completion) |
| Unauthorized | `/unauthorized` | PASS |
| Not Found | `*` → `NotFoundPage` | PASS (SPA 200 + catch-all) |

---

## 6. ADMIN akışı

| Adım | Beklenen | Gerçekleşen | Sonuç |
|---|---|---|---|
| ADMIN login | 200 + JWT | 200 | PASS |
| Users ekranı | liste | FE liste/search DataGrid | PASS (okuma) |
| Yeni PM oluştur | mümkün | **API** `POST /users` → 201; **FE UI yok** | API PASS · **GAP-001** |
| Yeni proje oluştur | mümkün | **API** `POST /projects` + `managerId` → 201; **FE** toast: “Yeni proje ekranı henüz eklenmedi” | API PASS · **GAP-002** |
| Project Manager ata | manager atanır | Create/update `managerId` ile atanıyor | API PASS |
| `project_assignments` | ilişki | Create sonrası satır **0**; erişim `projects.manager_id` + opsiyonel assignment entity | **GAP-003** |

> **Gap completion güncellemesi (aynı gün):** GAP-001/002/003 **RESOLVED**. Users UI create/edit/status; Projects create/edit dialog; Assignment API + Ekip paneli + manager sync. Detay: `docs/analysis/Day17_Admin_Project_Assignment_Gaps_Completion.md`.
| Proje listede | görünür | `GET /projects` + CTO portfolio search | PASS |

---

## 7. PROJECT_MANAGER akışı

| Adım | Sonuç |
|---|---|
| PM login | PASS |
| Yalnız atanmış proje | PASS (`GET /dashboard/projects/{own}` 200) |
| Atanmadığı proje URL | PASS (**403**) |
| Haftalık rapor oluştur (planned/actual/completed/next/note) | PASS (`POST /api/v1/reports`) |
| Rapor detay | PASS |
| Work Item create + status update | PASS |
| Risk create + level/action plan | PASS |
| Genel dashboard | PASS (**403** — sözleşme) |

---

## 8. CTO akışı

| Adım | Sonuç |
|---|---|
| CTO login | PASS |
| Dashboard summary KPI | PASS (`totalProjects` arttı) |
| Portfolio’da yeni proje | PASS (search) |
| Health / current week / latest report | PASS (detail `latestReport=true`) |
| Project Detail risk/WI görünürlüğü | PASS (API detail + rapor ilişkili kayıtlar) |
| CTO mutate (report/WI/risk) | PASS (**403**) |
| FE edit aksiyonları | Kod: `canCreateReport && !isCto`, `canEditProject={false}` | PASS (read-only CTO) |

---

## 9. Auth / role regression

| Senaryo | Beklenen | Gerçekleşen | Sonuç |
|---|---|---|---|
| Token yok → protected | 401 | 401 | PASS |
| Invalid JWT | 401 | 401 | PASS |
| PM dashboard summary | 403 | 403 | PASS |
| PM başka proje | 403 | 403 | PASS |
| CTO mutate | 403 | 403 | PASS |
| ADMIN management (`/users`, `/projects`) | 200/201 | 200/201 | PASS |
| Expired JWT | 401 | **NOT_TESTED** (süre doldurma yapılmadı) | NOT_TESTED |

---

## 10. Weekly Report regression

| Senaryo | Sonuç |
|---|---|
| Valid create | PASS 201 |
| Duplicate | PASS 409 + sözleşme mesajı (BUG-001) |
| week 0 / 54 | PASS 400 |
| progress &lt;0 / &gt;100 | PASS 400 |
| Unhealthy without open risk | PASS 400 BUSINESS_RULE (BUG-002) |
| Unhealthy with open risk (update) | PASS 200 |

Endpoint: `/api/v1/reports` (Swagger “Weekly Reports”).

---

## 11. Work Item regression

| Senaryo | Sonuç |
|---|---|
| Create / update | PASS |
| Invalid status | PASS 400 |
| Empty title | PASS 400 |
| Unauthorized PM | PASS 403 |
| Invalid report id | PASS 404 |
| Empty path PUT | PASS 404 (BUG-003) |

---

## 12. Risk regression

| Senaryo | Sonuç |
|---|---|
| Create / update | PASS |
| LOW/MEDIUM/HIGH/CRITICAL | PASS 201 |
| Empty title / invalid level | PASS 400 |
| Unauthorized PM | PASS 403 |
| Empty path PUT | PASS 404 (BUG-003) |

---

## 13. Dashboard regression

| Alan | Sonuç |
|---|---|
| summary | PASS |
| health distribution | PASS |
| recent / latest reports | PASS |
| project portfolio | PASS |
| search / status / sort / pagination | PASS (API) |
| health / report / risk filter | PASS (endpoint + FE filter bar mevcut; API smoke ACTIVE+sort) |
| project detail geçişi | PASS (API) |
| back navigation / query state | **NOT_TESTED** (manuel tarayıcı tıklama) → polish turunda **PASS** (`from=dashboard` + `dashboardReturnQuery` / detail geri dönüş) |

---

## 14. Responsive sonuçları

| Viewport | Sonuç | Not |
|---|---|---|
| 1440×900 | **NOT_TESTED** → polish **PASS** | Dialog/form responsive constraints |
| 1366×768 | **NOT_TESTED** → polish **PASS** | |
| 768×1024 | **NOT_TESTED** → polish **PASS** | scroll + sticky actions |
| 390×844 | **NOT_TESTED** → polish **PASS** | fullWidth dialog, m:1 |

Day 15 UI sprint’lerinde responsive hedeflendi. İlk regression turunda viewport matrisi açık bırakıldı; Final Product Polish turunda dialog/panel viewport güvenliği doğrulandı (bkz. analysis polish bölümü).

---

## 15. Error state sonuçları

| Senaryo | Sonuç |
|---|---|
| Backend kapalıyken FE error + retry | **NOT_TESTED** → polish **PASS** (kontrollü BE stop → health DOWN, FE 200, restart → health 200 + smoke; `AppErrorState`/`onRetry` kod yolu) |
| Invalid project id → 404 | PASS |
| Unauthorized route / 403 | PASS (API + `/unauthorized`) |
| Invalid JWT → 401 | PASS |

---

## 16. Test matrisi (özet)

API + FE shell koşusu: **57 / 57 PASS**, **0 FAIL**.

Detay: `Day17_results.csv`.

Öne çıkan ID’ler:

| Test ID | Alan | Sonuç | Bug/Gap |
|---|---|---|---|
| AUTH-01..03 | Auth | PASS | |
| ADM-01, ADM-03, ADM-06 | Admin API | PASS | |
| ADM-07 | Assignment | PASS (gözlem) | GAP-003 |
| PM-01..04 | PM erişim | PASS | |
| WR-01..09 | Reports | PASS | BUG-001/002 |
| WI-01..07 | Work items | PASS | BUG-003 |
| RK-* | Risks | PASS | BUG-003 |
| CTO-01..06 | CTO | PASS | |
| DASH-01..03 | Dashboard | PASS | |
| ERR-01 | Error | PASS | |
| FE/* | Frontend shell | PASS | |
| GAP-001..003 | Gaps | kayıt | GAP |

---

## 17. Bulunan yeni buglar

**Yeni regression bug: 0.**

Day 15/16 açık bug’ları yeniden FAIL olmadı.

---

## 18. Bulunan functional gap’ler

> Eski bulgular korunmuştur. Gap completion sonrası durum: **RESOLVED**.

### GAP-001 — Admin kullanıcı oluşturma UI eksik → **RESOLVED**

| | |
|---|---|
| Requirement | Yönetmelik / README: ADMIN `POST /users` ile PM/CTO oluşturur |
| Backend | **Var** — `POST /api/v1/users` (fullName, email, password, role) |
| Frontend (regression) | **Yok** — `UsersPage` yalnız liste/search; `usersApi.createUser` tanımlı ama UI bağlı değil |
| Frontend (completion) | **Var** — `UserFormDialog` + create/edit/status; yalnız ADMIN yazma |
| Status | **RESOLVED** |

### GAP-002 — Admin proje oluşturma UI eksik → **RESOLVED**

| | |
|---|---|
| Requirement | ADMIN proje oluşturma + manager atama |
| Backend | **Var** — `POST /api/v1/projects` (`managerId` zorunlu) |
| Frontend (regression) | **Kısmi** — “Yeni Proje” butonu toast: *Yeni proje ekranı henüz eklenmedi* |
| Frontend (completion) | **Var** — `ProjectFormDialog` create (portfolio) + edit (detail) |
| Status | **RESOLVED** |

### GAP-003 — `project_assignments` UI/API CRUD eksik → **RESOLVED**

| | |
|---|---|
| Requirement | Kullanıcı–proje ilişkilendirme / atama (şema + entity mevcut) |
| Backend (regression) | Entity + repo; public CRUD yok; create assignment yazmıyordu |
| Backend (completion) | `GET/POST/DELETE .../projects/{id}/assignments` + manager sync |
| Frontend (completion) | Project Detail **Ekip** sekmesi (`ProjectTeamPanel`) |
| Status | **RESOLVED** |

---

## 19. Kalan riskler

1. Expired JWT süresi doldurma senaryosu hâlâ **NOT_TESTED**.
2. Risk resolve/delete sonrası unhealthy rapor yeniden-doğrulama (Day16 notu) hâlâ açık tasarım riski — bug olarak sınıflanmadı.
3. PM proje listesi FE’de “assigned projects” türetmesi; ayrı PM list endpointi yok (bilinen sınır).
4. Responsive / BE-down / back-nav: Final Product Polish turunda kapatıldı.

---

## 20. MVP stabilite kararı

### İlk regression kararı: **B) MVP STABLE WITH GAPS**

Ana akışlar (auth, rol ayrımı, proje erişimi, haftalık rapor, work item, risk, CTO dashboard/read-only) **stabil**. Day16 bug’ları regression’da yeşil. GAP-001..003 backlog’daydı.

### Gap completion sonrası: **A) MVP STABLE**

GAP-001 / GAP-002 / GAP-003 kapatıldı. Day18 dokümantasyona geçilebilir.

---

## 21. Day18’e geçiş hazırlığı

1. Dokümantasyon paketi: API özeti, rol matrisi, bilinen gap listesi (GAP-001..003).
2. Opsiyonel follow-up sprint: Admin User/Project create UI + assignment politikası.
3. Production smoke (ortam hazırsa) — Day17 local E2E referans alınabilir (`day17_e2e.ps1`).
4. Opsiyonel: expired JWT negatif senaryosu.

---

## Ek: Ortam / komut özeti

```text
GET /api/v1/health → 200
./mvnw test → 64/64 PASS
./mvnw clean package → BUILD SUCCESS
npm run build → PASS
npm run lint → PASS
day17_e2e.ps1 → 57/57 PASS
```
