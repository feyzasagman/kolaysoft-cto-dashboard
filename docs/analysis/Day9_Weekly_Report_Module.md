# Kolaysoft CTO Dashboard

## 9. Gün Weekly Report Module Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — Weekly Report Module |
| Tarih | 31 Temmuz 2026 |
| Sürüm | 1.0 |
| Durum | Day 9 tamamlandı |
| Kapsam dışı | Dashboard, Notifications, Email, File Upload |

---

## Purpose

Bu günün amacı haftalık proje durum raporlama modülünü tamamlamaktır:

- Weekly Report CRUD
- Work Item CRUD
- Risk Issue CRUD
- Proje sahipliğine dayalı yetkilendirme
- Aynı proje + hafta için tek rapor kuralı

---

## Architecture

```text
Controller → Service → ProjectAccessService / Repository
                ↓
             DTO / Mapper → ApiResponse<T>
```

Ana bileşenler:

| Bileşen | Görev |
|---|---|
| `WeeklyReportController` | `/api/v1/reports` |
| `WorkItemController` | `/api/v1/work-items` |
| `RiskIssueController` | `/api/v1/risks` |
| `WeeklyReportServiceImpl` | Rapor iş kuralları + duplicate kontrolü |
| `WorkItemServiceImpl` | İş kalemi CRUD |
| `RiskIssueServiceImpl` | Risk CRUD |
| `ProjectAccessService` | ADMIN/CTO/PM proje erişim kontrolü |
| `SecurityUtils` | Mevcut kullanıcı okuma |

Entity doğrudan expose edilmez.

---

## Business Rules

1. `PROJECT_MANAGER` yalnızca kendi yönettiği / atandığı projeler için rapor oluşturabilir.
2. Aynı `projectId + weekNumber` için ikinci rapor → HTTP `409`.
3. `CTO` yalnız okuyabilir.
4. `ADMIN` tüm raporları yönetebilir.
5. WorkItem ve RiskIssue bir `WeeklyReport` kaydına bağlıdır.
6. Progress alanları `0-100`, weekNumber `1-53` aralığındadır.

Not: Entity katmanında `(project_id, year, week_number)` unique constraint korunur; API duplicate kontrolü iş kuralı gereği `project + weekNumber` üzerinden yapılır.

---

## Endpoints

### Weekly Reports

| Method | Path | Yetki |
|---|---|---|
| GET | `/api/v1/reports` | ADMIN, CTO, PROJECT_MANAGER |
| GET | `/api/v1/reports/{id}` | ADMIN, CTO, PROJECT_MANAGER |
| GET | `/api/v1/reports/project/{projectId}` | ADMIN, CTO, PROJECT_MANAGER |
| POST | `/api/v1/reports` | ADMIN, PROJECT_MANAGER |
| PUT | `/api/v1/reports/{id}` | ADMIN, PROJECT_MANAGER |
| DELETE | `/api/v1/reports/{id}` | ADMIN, PROJECT_MANAGER |

### Work Items

| Method | Path | Yetki |
|---|---|---|
| GET | `/api/v1/work-items` | ADMIN, CTO, PROJECT_MANAGER |
| POST | `/api/v1/work-items` | ADMIN, PROJECT_MANAGER |
| PUT | `/api/v1/work-items/{id}` | ADMIN, PROJECT_MANAGER |
| DELETE | `/api/v1/work-items/{id}` | ADMIN, PROJECT_MANAGER |

### Risks

| Method | Path | Yetki |
|---|---|---|
| GET | `/api/v1/risks` | ADMIN, CTO, PROJECT_MANAGER |
| POST | `/api/v1/risks` | ADMIN, PROJECT_MANAGER |
| PUT | `/api/v1/risks/{id}` | ADMIN, PROJECT_MANAGER |
| DELETE | `/api/v1/risks/{id}` | ADMIN, PROJECT_MANAGER |

---

## DTO

### Weekly Report

- Request: `projectId`, `weekNumber`, `reportDate`, `plannedProgress`, `actualProgress`, `projectStatus`, `scheduleStatus`, `completedWork`, `plannedWork`, `overallNote`
- Response: `id`, proje bilgileri, `year`, `weekNumber`, progress ve metin alanları

### Work Item

- Request: `reportId`, `title`, `description`, `assignee`, `status`, `plannedDate`, `completedDate`, `note`
- Response: aynı alanlar + `id`

### Risk

- Request: `reportId`, `title`, `description`, `riskLevel`, `impact`, `actionPlan`, `status`
- Response: aynı alanlar + `id`

---

## Security

| Rol | Okuma | Yazma |
|---|---|---|
| ADMIN | Tüm kayıtlar | Tüm kayıtlar |
| CTO | Tüm kayıtlar | Yok |
| PROJECT_MANAGER | Kendi projeleri | Kendi projeleri |

PM sahipliği:

- `Project.manager.id == currentUser.id` veya
- `ProjectAssignment` kaydı mevcut

---

## Validation

Türkçe Bean Validation mesajları:

- `weekNumber` 1–53
- `plannedProgress` / `actualProgress` 0–100
- zorunlu alanlar (`projectId`, `reportDate`, `title`, `status`, `riskLevel` vb.)

---

## Tests

MockMvc senaryoları:

- Create Report → 201
- Duplicate Report → 409
- Validation → 400
- Unauthorized → 401
- Forbidden (CTO create) → 403
- Create WorkItem → 201
- Create Risk → 201

Komut:

```powershell
cd backend/cto-dashboard-api
./mvnw clean package
```

Doğrulanan sonuç (31 Temmuz 2026):

- Tests run: 32
- Failures: 0
- Errors: 0
- BUILD SUCCESS

Canlı doğrulama:

- Report create → 201
- Duplicate report → 409
- WorkItem create → 201
- Risk create → 201
- Swagger tags: Weekly Reports, Work Items, Risks

---

## Problems

1. Day 6 unique constraint `(project, year, week)` iken Day 9 kuralı `(project, week)` idi.
2. PROJECT_MANAGER için proje sahipliği Day 8’de `manager` alanı + `ProjectAssignment` ile dağınıktı.
3. Nested WorkItem/Risk erişiminde parent rapor yetkisi kontrolü gerekiyordu.

---

## Solutions

1. API duplicate kontrolü `projectId + weekNumber` üzerinden `ConflictException` ile yapıldı.
2. `ProjectAccessService` hem manager hem assignment kontrolü uygular.
3. WorkItem/Risk servisleri parent report’un projesine `requireWritableProject` uygular.

---

## Next Day Plan

1. Dashboard özet endpointleri (CTO görünümü)
2. Haftalık rapor filtreleme / sayfalama
3. PROJECT_MANAGER için proje listesi (kendi projeleri)
4. Flyway migration geçişi
