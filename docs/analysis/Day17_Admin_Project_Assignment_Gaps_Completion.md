# Day 17 — Admin / Project Assignment Gaps Completion

| Bilgi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Tarih | 10 Ağustos 2026 |
| Kapsam | GAP-001 / GAP-002 / GAP-003 tamamlanması |
| Kural | Mevcut mimari korunur; yalnızca gerekli minimal endpoint + UI |

---

## 1. Amaç

Day 17 full-stack regression’da tespit edilen üç functional gap’i kapatmak: Admin kullanıcı yönetimi UI, Admin proje oluşturma/düzenleme UI, ProjectAssignment API + Project Detail ekip paneli. Bu çalışma opsiyonel feature değil; MVP Admin yönetim akışının tamamlanmasıdır.

---

## 2. Day17 regression’da bulunan gap’ler

| Gap | Bulgu (Day17) | Bu tur |
|---|---|---|
| GAP-001 | UsersPage yalnız liste; create API kullanılmıyordu | **RESOLVED** |
| GAP-002 | “Yeni Proje” toast stub | **RESOLVED** |
| GAP-003 | Entity/repo var; public API/UI yok; create assignment yazmıyordu | **RESOLVED** |

---

## 3. GAP-001 çözümü

### Backend
Mevcut endpointler yeniden kullanıldı (yeni endpoint yok):

- `GET/POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}/status`
- Write: **ADMIN**; Read: ADMIN + CTO

### Frontend
- `UserFormDialog` — create/edit (`fullName`, `email`, `role`, password)
- `UsersPage` — Yeni Kullanıcı, Düzenle, Aktif/Pasif
- `usersApi.updateUser` / `updateUserStatus` + React Query mutations
- CTO: liste görür, yönet butonları gizli (backend 403 koruması sürer)

---

## 4. GAP-002 çözümü

### Backend
Mevcut:

- `POST /api/v1/projects`
- `PUT /api/v1/projects/{id}`
- Manager: yalnız aktif `PROJECT_MANAGER`
- Unique code → 409

Create/update sonrası ana PM için assignment senkronu eklendi (`ensureManagerAssignment`).

### Frontend
- `ProjectFormDialog` — code, name, description, managerId, status, dates
- `AdminProjectsView` — Yeni Proje dialog (toast kaldırıldı)
- `ProjectDetailPage` — ADMIN “Düzenle” → aynı form
- Manager seçimi: aktif PROJECT_MANAGER listesi

---

## 5. GAP-003 çözümü

### Model (A)
- `Project.managerId` = ana proje yöneticisi
- `ProjectAssignment` = ekip atamaları (+ manager satırı senkron)
- Erişim: `ProjectAccessService` → manager **veya** assignment

### Yeni backend API
| Method | Path | Yetki |
|---|---|---|
| GET | `/api/v1/projects/{projectId}/assignments` | ADMIN, CTO, PM (okunabilir proje) |
| POST | `/api/v1/projects/{projectId}/assignments` | ADMIN |
| DELETE | `/api/v1/projects/{projectId}/assignments/{userId}` | ADMIN |

Kurallar:

- duplicate → 409
- inactive user → 400 BUSINESS_RULE
- missing user/assignment → 404
- ana manager ataması silinemez → 400 BUSINESS_RULE
- CTO/PM write → 403

### Frontend
- Project Detail sekmesi: **Ekip**
- `ProjectTeamPanel` — yönetici + atamalar; ADMIN ata/kaldır; CTO/PM read-only

---

## 6. Kullanıcı yönetimi akışı

1. ADMIN → `/users` → Yeni Kullanıcı (örn. PROJECT_MANAGER)
2. Liste / arama / düzenle / aktif-pasif
3. Duplicate email → 409 mesajı toast’ta

---

## 7. Proje yönetimi akışı

1. ADMIN → `/projects` → Yeni Proje (manager seç)
2. Portfolio’da görünür; manager assignment otomatik oluşur
3. Detail → Düzenle ile güncelleme

---

## 8. Assignment modeli

```
Project.manager ──► User (PRIMARY PM)
ProjectAssignment ──► (project, user, assignmentRole) UNIQUE(project,user)
```

Create/update manager → `PROJECT_MANAGER` assignment yoksa eklenir.  
Ek kullanıcılar `POST .../assignments` ile atanır.

---

## 9. Role-based security

| İşlem | ADMIN | CTO | PM |
|---|---|---|---|
| User create/update/status | ✓ | 403 | 403 |
| Project create/update | ✓ | 403 | 403 |
| Assignment write | ✓ | 403 | 403 |
| Assignment read | ✓ | ✓ (okunabilir) | ✓ (atanmış proje) |
| Dashboard write mutate | — | 403 | 403 (dashboard summary) |

Frontend gizleme backend yerine geçmez.

---

## 10. Test sonuçları

| Komut | Sonuç |
|---|---|
| `./mvnw test` | **BUILD SUCCESS** — Tests run: **79**, Failures: 0 |
| `./mvnw clean package` | **BUILD SUCCESS** |
| `npm run build` | **PASS** |
| `npm run lint` | **PASS** |

Yeni/genişleyen testler:

- `ProjectAssignmentControllerTest` (list/assign/delete, 403/409/400/401)
- `UserControllerTest` update + status
- `ProjectControllerTest` update

---

## 11. E2E demo sonucu

Canlı API smoke (restart sonrası):

| Adım | Sonuç |
|---|---|
| ADMIN user create (PM/CTO/extra) | 201 |
| ADMIN project create + manager | 201 · assignment sync |
| Extra assignment | 201 |
| Duplicate assignment | 409 |
| CTO assignment write | 403 · read 200 |
| PM own project + report | 200 / 201 · assignment write 403 |
| Inactive user assign | 400 |
| CTO portfolio sees project | found |

---

## 12. Kalan eksikler

1. Ayrı “assignment role” yönetimi UI’si minimal (sistem rolü / MEMBER).
2. Portfolio satırından inline edit yok (detail’den Düzenle var).
3. Dedicated PM proje listesi endpointi hâlâ yok (mevcut assigned-projects türetmesi).

---

## Final Product Polish

Son kalite turu (yeni feature yok): Admin/PM/CTO operasyonel UX sertleştirildi.

### Form validation

- `ProjectFormDialog`: code/name zorunlu (*), manager zorunlu, tarih geçerliliği, `targetEndDate < startDate` → Türkçe alan altı mesaj.
- Code whitespace temizlenir + trim/uppercase; description opsiyonel etiketi.
- `UserFormDialog`: ad/email/rol zorunlu; create’te şifre zorunlu; edit’te şifre opsiyonel.
- Backend validation authoritative; FE yalnızca UX.

### Submit UX

- Submit sırasında button disabled + `CircularProgress` + çift tıklama engeli.
- Dialog kapanmadan sonuç beklenir.
- Toast: “Proje başarıyla oluşturuldu/güncellendi.”, kullanıcı create/update başarı mesajları.
- 409: e-posta / proje kodu için anlamlı Türkçe mesaj (`getErrorMessage`).

### Enum localization

- Proje durumu: Aktif, Tamamlandı, Beklemede… (`PROJECT_STATUS_OPTIONS` / `statusLabel`)
- Rol: Yönetici / CTO / Proje Yöneticisi (`roleLabel`); API enum değeri aynı kalır.
- Assignment `MEMBER` → Üye.

### Role UI

- ADMIN: Yeni Proje, Düzenle, kullanıcı yönetimi, assignment write.
- CTO / PM: write butonları gizli; team read-only.
- Backend `@PreAuthorize` korunur.

### Assignment UX

- Hiyerarşi: Proje Yöneticisi kartı (avatar + email + badge) → Proje Ekibi tablosu.
- Manager ekip listesinden ayrıldı; “Atamayı Kaldır” manager için yok.
- Assign dropdown: inactive / atanmış / manager hariç.
- Kaldırma: `ConfirmDialog`.

### Responsive

Dialog/panel Paper: viewport margin, `maxHeight`, content scroll, sticky actions, tablo `overflowX: auto`.

| Viewport | Sonuç |
|---|---|
| 1440×900 | PASS (dialog/form layout constraints) |
| 1366×768 | PASS |
| 768×1024 | PASS (scroll + actions erişilebilir) |
| 390×844 | PASS (fullWidth dialog, m:1, no overflow pattern) |

### Accessibility

- Dialog `aria-labelledby`, required `aria-required`, busy `aria-busy`.
- Label/Select association (`labelId`).
- Escape/close submitting iken kapalı; ConfirmDialog mevcut pattern.

### Error / retry

- Controlled BE-down: health DOWN, FE SPA 200, AppErrorState+retry kod yolu mevcut.
- BE yeniden açıldı → health 200; smoke devam etti → **PASS**.

### Back-navigation

- Dashboard `detailQuerySuffix` + `from=dashboard`; Detail `dashboardQuery` ile filter/query geri dönüşü → **PASS**.

### Regression

| Komut | Sonuç |
|---|---|
| `./mvnw test` | 79/79 PASS |
| `./mvnw clean package` | SUCCESS |
| `npm run build` / `lint` | PASS |
| ADMIN/PM/CTO smoke | PASS |
| Day16 BUG-001/002/003 | suite içinde yeşil |

**MVP final kararı:** **A) MVP STABLE**

---

## Executive Intelligence & Attention Center

### Amaç

Yeni backend endpointi, AI/LLM, DB/entity değişikliği veya sahte veri olmadan; mevcut gerçek proje, rapor, risk ve work item alanlarından deterministik yönetici içgörüsü üretmek. CTO’nun 5 saniyede hangi projeye neden bakması gerektiğini görmesi.

Bu özellik “AI özeti” değildir; saf mapper mantığıdır.

### Kullanılan gerçek veri alanları

| Alan | Kaynak |
|---|---|
| `progressTarget` / `progressActual` | Project detail / dashboard row |
| `health` / `latestHealth` | Latest report health |
| `openRiskCount` / `criticalRiskCount` | Risk listesi veya dashboard row |
| `openWorkItems` | Work items listesi (açık sayım) |
| `hasCurrentWeekReport` | Dashboard: API alanı; Detail: `latestReport.year` + `weekNumber` vs `currentIsoWeek` |
| `latestReport` varlığı | `hasAnyReport` (ilerleme “veri yok” sinyali) |

### Insight logic (`buildExecutiveProjectInsight`)

Çıktı: `{ severity, headline, summary, signals[] }`

- `actual < target` → “Hedefin X puan gerisinde”; `>=` → uyumlu / üzerinde
- `criticalRiskCount > 0` → kritik risk sinyali
- `openRiskCount > 0` → açık risk sinyali
- `hasCurrentWeekReport == false` → rapor eksik
- `health` GREEN / YELLOW / RED → sağlık metni + severity
- Özet: 2–3 cümle, yalnızca gözlenen facts (+ veriye bağlı öncelik cümlesi); uydurma tavsiye yok
- Signal kartları: Hedef Farkı, Risk Durumu, Rapor Durumu, Sağlık

UI: `ExecutiveProjectInsight` — Project Detail’de Hero + MetricGrid altında, tab’lardan önce.

### Attention logic (`buildPortfolioAttentionItems`)

Bir proje Attention Center’a girer (en az biri):

- `health == RED` veya `YELLOW`
- `criticalRiskCount > 0`
- `hasCurrentWeekReport == false`
- `target − actual >= PROGRESS_GAP_ATTENTION_THRESHOLD` (10, frontend constant)

UI: `PortfolioAttentionCenter` — Dashboard’da KPI’ların altında; mevcut `portfolioRows` ile (`useMemo` sıralama). Yeni fetch yok.

Empty state gizlenmez: “Şu anda öncelikli müdahale gerektiren proje bulunmuyor.”

### Attention score (UI-only)

Backend’e yazılmaz; yalnızca sıralama:

| Kural | Puan |
|---|---|
| critical risk | +4 |
| RED health | +3 |
| YELLOW health | +2 |
| missing current report | +2 |
| progress gap ≥ 10 | +1 |

Hesap: `computeAttentionScore` (util); component içinde değil.

### UI-only karar

- Attention score / threshold / reason metinleri yalnızca frontend.
- Backend business rule gibi davranılmaz.
- Yeni API yok; entity/DB değişmedi.

### Veri yok davranışı

- İlerleme 0/0 ve rapor yok → “Veri yok” + özet açıkça belirtir.
- Sağlık yok → “Rapor yok”.
- Attention boş → olumlu empty state (gizlenmez).

### Rol davranışı

| Rol | Insight (Project Detail) | Attention Center (Dashboard) |
|---|---|---|
| CTO | Read-only (detail erişimi varsa) | Görür (dashboard ADMIN/CTO) |
| ADMIN | Görüntüler | Görür |
| PROJECT_MANAGER | Kendi projesinde insight görür | Dashboard route’u kapalı → Attention Center görünmez |

### Responsive

- Attention: desktop grid/liste; tablet/mobile stack; tek kolon; horizontal overflow yok.
- Insight signals: md 4 kolon, sm 2×2, xs tek kolon.

### Accessibility

- Severity metin etiketi + renk (yalnızca renkle değil).
- Signal / gap / reason `aria-label`.
- “Projeyi Gör” accessible name (`${name} projesini gör`).
- Keyboard: Button navigation.

### Dosyalar

- `frontend/src/utils/executiveInsight.ts`
- `frontend/src/components/projects/ExecutiveProjectInsight.tsx`
- `frontend/src/components/dashboard/PortfolioAttentionCenter.tsx`
- `ProjectDetailPage` / `DashboardPage` entegrasyonu
