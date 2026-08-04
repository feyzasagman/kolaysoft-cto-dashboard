# Kolaysoft CTO Dashboard

## 12. Gün — Haftalık Rapor, İş Kalemi ve Risk Frontend Akışı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu |
| Tarih | 4 Ağustos 2026 |
| Sürüm | 1.0 |
| Durum | Day 12 PM akışı tamamlandı (frontend) |
| Kapsam dışı | Backend mimari değişikliği, AI, bildirim, export, audit log, yeni dashboard tasarımı |

---

## 1. Günün amacı

Project Manager için haftalık rapor, iş kalemi ve risk akışını mevcut Spring Boot API sözleşmesine uygun şekilde React frontend’de uçtan uca tamamlamak.

---

## 2. Yönetmelikteki 12. gün hedefi

- React + TypeScript frontend üzerinde rol bazlı ekranlar
- PM: proje görünümü → rapor oluşturma/düzenleme → iş kalemi/risk yönetimi
- CTO: salt okunur rapor görüntüleme
- Gerçek API entegrasyonu; sahte başarı verisi yok

---

## 3. Mevcut durum

- Spring Boot + PostgreSQL + JWT çalışıyor
- User / Project / WeeklyReport / WorkItem / RiskIssue backend modülleri mevcut
- Frontend: React 18, Vite, MUI, TanStack Query, Axios, RHF + Zod
- Login ve dashboard okuma entegrasyonu önceki adımlarda hazırdı
- Bu günde rapor CRUD, work item ve risk UI eklendi

---

## 4. Proje yöneticisi kullanıcı akışı

1. PM login → `/projects`
2. Atanmış / bilinen projeleri görür
3. **Haftalık Rapor Oluştur** → `/reports/new?projectId=…`
4. Formu doldurur, kaydeder
5. `/reports/:id` detay açılır
6. İş kalemi ekler / durum günceller
7. Risk ekler / durum günceller
8. CTO aynı raporu listeden/detaydan okur; düzenleme butonları yok

**API boşluğu:** `GET /projects` ve `GET /dashboard/projects` yalnızca ADMIN/CTO. PM listeyi doğrudan alamaz. Frontend:

- PM’nin raporlarından `projectId` toplar
- Bilinen id’leri `localStorage` (`cto_known_project_ids`) ile saklar
- Her id için `GET /dashboard/projects/{id}` çağırır (PM erişebilir)

İlk rapor için derin bağlantı: `/reports/new?projectId={id}`.

---

## 5. Haftalık rapor formu

Rotalar:

- `/reports/new`
- `/reports/:id`
- `/reports/:id/edit`

Alanlar (backend `CreateWeeklyReportRequest`):

- `projectId`, `weekNumber` (1–53), `reportDate`
- `plannedProgress`, `actualProgress` (0–100, opsiyonel)
- `projectStatus`, `scheduleStatus` (serbest string ≤50)
- `completedWork`, `plannedWork`, `overallNote`

`year` istemciden gönderilmez; backend `reportDate` yılını kullanır.

409 çakışmada kullanıcı mesajı:

> Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.

---

## 6. İş kalemi akışı

- Liste: `GET /work-items?reportId=`
- Oluştur / güncelle / sil: `/work-items`
- Alanlar: `title`, `description`, `assignee`, `status`, `plannedDate`, `completedDate`, `note`, `reportId`
- Durumlar: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`
- Backend `DONE` için `completedDate` zorunlu tutmaz; frontend de zorunlu kılmaz

---

## 7. Risk / engel akışı

- Liste: `GET /risks?reportId=`
- CRUD: `/risks`
- Alanlar: `title`, `description`, `riskLevel`, `impact`, `actionPlan`, `status`, `reportId`
- Seviye: LOW/MEDIUM/HIGH/CRITICAL → Düşük/Orta/Yüksek/Kritik
- Durum: OPEN/IN_PROGRESS/RESOLVED/ACCEPTED
- CRUD DTO’da `type` alanı yok

---

## 8. API entegrasyonu

| İşlem | Endpoint |
|---|---|
| Rapor liste/detay | `GET /reports`, `GET /reports/{id}` |
| Rapor oluştur/güncelle | `POST /reports`, `PUT /reports/{id}` |
| İş kalemleri | `GET/POST /work-items`, `PUT/DELETE /work-items/{id}` |
| Riskler | `GET/POST /risks`, `PUT/DELETE /risks/{id}` |
| PM proje detay | `GET /dashboard/projects/{id}` |
| Admin proje listesi | `GET /dashboard/projects` |

Servisler: `reportsApi`, `workItemsApi`, `riskIssuesApi`, `projectsApi`, `dashboardApi`.

---

## 9. Rol bazlı ekran davranışları

| Rol | Projeler | Rapor oluştur/düzenle | Work item / risk yazma |
|---|---|---|---|
| PROJECT_MANAGER | Atanmış/bilinen | Evet (kendi projeleri) | Evet |
| CTO | Dashboard listesi | Hayır (butonlar gizli + 403) | Hayır |
| ADMIN | Dashboard listesi | Evet | Evet |

Frontend gizleme güvenlik yerine geçmez; 401/403 ayrıca ele alınır.

---

## 10. Validation kuralları

- React Hook Form + Zod
- Türkçe mesajlar
- Backend `fields` map’i forma/toast’a yansıtılır
- Submit sırasında buton disable

---

## 11. Loading / empty / error durumları

- Skeleton / LoadingState
- EmptyState (ilk kullanım vs filtre)
- ErrorState + Tekrar Dene
- 401 → oturum akışı (axios interceptor)
- 403 → `/unauthorized`

---

## 12. Responsive kararlar

- Form: md+ 2 sütun, mobil tek sütun
- Work item / risk: tablo + yatay scroll
- Dialog: fullWidth, sm max

---

## 13. Test senaryoları

Frontend’de vitest/RTL yok; yeni test kütüphanesi eklenmedi.

Doğrulama:

1. API ile PM oluşturma + proje atama
2. PM rapor oluşturma
3. Duplicate 409
4. Work item oluşturma + durum güncelleme
5. Risk oluşturma
6. CTO okuma + güncelleme 403
7. `npm run build` / `npm run lint`

---

## 14. Gerçek test sonuçları

Tarih: 4 Ağustos 2026 — çalışan Docker Postgres + backend + frontend.

| Adım | Sonuç |
|---|---|
| ADMIN login | Başarılı |
| PM kullanıcı oluşturma | Başarılı (`pm.day12.51187@kolaysoft.com.tr`) |
| CTO kullanıcı oluşturma | Başarılı |
| Proje atama (`D12-51187`, id=2) | Başarılı |
| PM `GET /projects` | 403 (beklenen boşluk) |
| PM `GET /dashboard/projects/2` | Başarılı |
| PM rapor oluşturma (id=2, 2026/W32) | Başarılı |
| Duplicate rapor | Conflict (beklenen) |
| Work item + status IN_PROGRESS | Başarılı |
| Risk HIGH/OPEN | Başarılı |
| CTO rapor okuma | Başarılı |
| CTO rapor güncelleme | Forbidden (beklenen) |

---

## 15. Karşılaşılan hatalar

1. PM proje listesi endpointi yok
2. `customer` response DTO’da yok
3. PowerShell `ISOWeek` tipi yok (E2E scriptte Calendar ile aşıldı)
4. Zod + RHF progress tipi uyumsuzluğu (string alan + manuel parse)

---

## 16. Yapılan düzeltmeler

- PM proje keşfi: raporlar + bilinen id önbelleği + dashboard detail
- 409 mesajı kullanıcı diline map edildi
- Rapor formu tip hataları giderildi
- CTO için write route/UI engeli
- Build/lint temizlendi

---

## 17. Tekrar test sonuçları

- `npm run build` → başarılı
- `npm run lint` → 0 error (2 mevcut react-refresh uyarısı)
- API E2E akışı → başarılı

---

## 18. Açık kalan riskler

- PM’nin hiç raporu / bilinen id’si yoksa proje listesi boş kalır
- Dedicated “my projects” endpointi hâlâ gerekli
- Otomatik UI testleri yok
- Kaydedilmemiş form için yalnızca `beforeunload` uyarısı var (in-app route blocker yok)

---

## 19. Sonraki gün planı

1. Backend: `GET /projects/mine` veya PM için scoped `GET /projects`
2. `customer` alanını ProjectResponse’a eklemek
3. Frontend unit/integration test altyapısı
4. PM ilk giriş onboarding (atanmış proje yoksa net yönlendirme)

---

## Önerilen commit

```text
feat: complete weekly report work item and risk frontend flow
```
