# Kolaysoft CTO Dashboard

## 10. Gün CTO Dashboard Backend Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — CTO Dashboard Backend |
| Tarih | 31 Temmuz 2026 |
| Sürüm | 1.0 |
| Durum | Day 10 tamamlandı |
| Kapsam dışı | Frontend, grafik çizimi, PDF/Excel export, AI, bildirimler |

---

## 1. Günün amacı

CTO ve ADMIN kullanıcılarının tüm projelerin genel durumunu tek dashboard üzerinden izleyebileceği backend API’lerini geliştirmek.

---

## 2. Mevcut sistem durumu

Day 1–9 sonrası:

- JWT authentication
- User / Project CRUD
- Weekly Report, Work Item, RiskIssue modülleri
- Rol bazlı yetkilendirme
- PostgreSQL + Swagger

Frontend henüz geliştirilmemiştir.

---

## 3. Dashboard mimarisi

```text
DashboardController
        ↓
DashboardService / DashboardServiceImpl
        ↓
ProjectAccessService + Repository aggregate/JOIN FETCH sorguları
        ↓
DTO (PageResponse / Summary / Detail)
```

Sağlık (`overallHealth`) entity alanı değildir; `ReportHealthCalculator` ile türetilir.

---

## 4. Summary metrikleri

`GET /api/v1/dashboard/summary`

| Alan | Kaynak / Varsayım |
|---|---|
| `totalProjects` / status sayaçları | `Project.status` |
| `riskyProjects` | Son raporu YELLOW/RED olan ACTIVE projeler |
| `totalReports` | `WeeklyReport` sayısı |
| `submittedReports` | Tüm raporlar SUBMITTED kabul edilir |
| `draftReports` | 0 (draft workflow yok) |
| `openRisks` | Status OPEN / IN_PROGRESS |
| `criticalRisks` | CRITICAL ve RESOLVED/ACCEPTED olmayan |
| `openBlockers` | `WorkItemStatus.BLOCKED` |
| `projectsWithoutCurrentWeekReport` | ACTIVE + mevcut ISO haftasında rapor yok |

---

## 5. Health distribution yaklaşımı

`GET /api/v1/dashboard/health-distribution`

Varsayım: yalnızca **ACTIVE** projeler dahil edilir.

Her proje için en güncel rapor (`year`, `weekNumber` max) alınır:

- Rapor yok → `noReport`
- Varsa `ReportHealthCalculator`:
  - `scheduleStatus` anahtar kelimeleri (ON_TRACK/AT_RISK/DELAYED…)
  - progress farkı (planned − actual)
  - açık HIGH/CRITICAL riskler
  - en kötü seviye seçilir

---

## 6. Kritik risk sorguları

`GET /api/v1/dashboard/critical-risks`

- Varsayılan: HIGH + CRITICAL ve açık statusler
- Filtre: `level`, `status`, `projectId`, `limit` (default 10)
- DTO eşlemesi:
  - `impactLevel` ← `riskLevel`
  - `mitigationPlan` ← `actionPlan`
  - `type` ← sabit `"RISK"`
  - `createdAt` ← rapor `reportDate` (proxy)

---

## 7. Son raporlar

`GET /api/v1/dashboard/latest-reports`

Opsiyonel filtreler: projectId, managerId, health, status, year, weekNumber, limit.

`reportStatus` her zaman `SUBMITTED`.  
`submittedAt` / `createdAt` → `reportDate.atStartOfDay()`.

---

## 8. Proje dashboard filtreleri

`GET /api/v1/dashboard/projects`

- DB Specification: search (code/name), managerId, projectStatus
- Bellek içi ek filtre: health, riskLevel, year, weekNumber, hasCurrentWeekReport
- Sayfalama zorunlu (`page`, `size`, varsayılan size 20)
- Sort: `name,asc` (izinli: name, code, status, createdAt, id)

---

## 9. Proje detay özeti

`GET /api/v1/dashboard/projects/{projectId}`

- ADMIN / CTO: tüm projeler
- PROJECT_MANAGER: yalnızca manager veya assignment ile atanmış proje
- `lastFiveReports` en yeni 5 raporu içerir

---

## 10. DTO yapısı

- `DashboardSummaryResponse`
- `HealthDistributionResponse`
- `CriticalRiskResponse`
- `LatestReportResponse`
- `ProjectDashboardResponse`
- `ProjectDashboardDetailResponse`
- `ReportHistoryItemResponse`
- `PageResponse<T>`

Entity doğrudan dönülmez.

---

## 11. Repository sorgu kararları

- Proje bazında en güncel rapor: year/weekNumber subquery
- ISO hafta eksik rapor count sorgusu
- Status / riskLevel aggregate count
- Critical risks: JOIN FETCH + Pageable limit
- N+1 azaltmak için reportId listesiyle batch risk/work-item yükleme

Native query kullanılmadı.

---

## 12. Güvenlik ve rol matrisi

| Endpoint | ADMIN | CTO | PROJECT_MANAGER |
|---|---|---|---|
| summary | ✔ | ✔ | ✖ |
| health-distribution | ✔ | ✔ | ✖ |
| critical-risks | ✔ | ✔ | ✖ |
| latest-reports | ✔ | ✔ | ✖ |
| projects | ✔ | ✔ | ✖ |
| projects/{id} | ✔ | ✔ | kendi projesi |

---

## 13. Validation

Query parametreleri:

- `limit` / `size`: 1–100
- `page` ≥ 0
- `weekNumber`: 1–53
- `year`: 2000–2100

`ConstraintViolationException` → HTTP 400, Türkçe mesaj.

---

## 14. ISO hafta hesaplama yaklaşımı

`WeekFields.ISO` kullanılır:

- `weekOfWeekBasedYear`
- `weekBasedYear`

Mevcut hafta sistem tarihinden hesaplanır.

Not: Rapor oluşturmada `year` alanı `reportDate.getYear()` ile set edilir; yıl dönümünde ISO week-based year ile küçük sapma olabilir. Bu açık nokta olarak kaydedilmiştir.

---

## 15. Testler ve sonuçları

MockMvc:

1. ADMIN summary → 200
2. CTO health distribution → 200
3. PROJECT_MANAGER summary → 403
4. Token yok → 401
5. Critical risks → 200
6. Latest reports limit → 200
7. Project pagination → 200
8. Atanmış PM proje detay → 200
9. Atanmamış PM proje detay → 403
10. Geçersiz limit/weekNumber → 400

Ek: `ReportHealthCalculatorTest`

Komut sonucu:

- Tests run: 46
- Failures: 0
- BUILD SUCCESS

---

## 16. Performans riskleri

- Health/riskLevel gibi türetilmiş filtrelerde in-memory paging kullanıldı; proje sayısı büyürse Specification’a taşınmalı.
- JOIN FETCH + Pageable Hibernate’de bellek içi sayfalama uyarısı üretebilir; limit düşük tutuldu.
- Büyük veri için materialized health alanı veya projection düşünülebilir.

---

## 17. Karşılaşılan sorunlar

1. Entity’de `overallHealth`, draft/submitted, risk `type` yoktu.
2. Blocker ayrı entity değildi.
3. Query param validation varsayılan olarak 500’e düşebiliyordu.

---

## 18. Çözüm yolları

1. Türetim + varsayımlar dokümante edildi; entity değiştirilmedi.
2. Blocker = `WorkItemStatus.BLOCKED`.
3. `ConstraintViolationException` handler eklendi.

---

## 19. Açık kalan noktalar

- Frontend dashboard UI yok
- Gerçek draft rapor akışı yok
- ISO week-year ile report.year hizalaması iyileştirilebilir
- Export / bildirim / AI yok

---

## 20. Sonraki gün planı

1. Dashboard frontend (React) iskeleti
2. CTO özet kartları ve proje tablosu
3. Rapor year alanını ISO week-based year ile hizalama
4. Flyway migration geçişi
