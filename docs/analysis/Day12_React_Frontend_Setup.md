# Kolaysoft CTO Dashboard

## 12. Gün React Frontend Kurulum Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — React Frontend Setup |
| Tarih | 4 Ağustos 2026 |
| Sürüm | 1.2 |
| Durum | Day 12 + kompakt aktivite şeridi / detay takvimi |
| Kapsam dışı | Backend değişikliği, DB, JWT server tarafı, AI, bildirimler |

---

## 1. Günün amacı

Mevcut Spring Boot API’yi tüketen React frontend iskeletini kurmak: auth, layout, routing, API client, temel ekranlar.

---

## 2. Teknoloji yığını

| Kütüphane | Amaç |
|---|---|
| React 18 + Vite + TypeScript | UI / build |
| React Router | Routing + protected routes |
| Axios | HTTP client |
| TanStack Query | Server state |
| Material UI + DataGrid | UI / tablolar |
| React Hook Form + Zod | Form validation |
| React Toastify | Kullanıcı bildirimleri |

---

## 3. Klasör yapısı

```text
frontend/
  src/
    api/           # Axios instance + interceptors
    assets/        # Statik varlıklar
    components/    # Ortak / domain bileşenleri
    contexts/      # AuthContext
    hooks/         # React Query hooks
    layouts/       # DashboardLayout, Sidebar, Topbar
    pages/
      login/
      dashboard/
      projects/
      reports/
      users/
      common/      # Settings, 404, 403
    routes/        # AppRouter, ProtectedRoute
    services/      # API service fonksiyonları
    theme/         # MUI theme
    types/         # API DTO tipleri
    utils/         # tokenStorage, error, refresh placeholder
```

---

## 4. Mimari

```text
Page (UI)
  → React Query hook
    → services/apiServices
      → api/axiosInstance (Bearer + error handler)
        → Spring Boot /api/v1/*
```

- Auth state: `AuthContext` + `localStorage`
- Layout: Sidebar + Topbar + Outlet
- Role guard: `ProtectedRoute` (`ADMIN` / `CTO` / `PROJECT_MANAGER`)

---

## 5. Authentication akışı

1. `POST /api/v1/auth/login` (`email`, `password`)
2. `accessToken`, `expiresIn`, kullanıcı bilgisi alınır
3. Token + user + `expiresAt` localStorage’a yazılır
4. Axios request interceptor: `Authorization: Bearer <token>`
5. 401 yanıtında refresh placeholder denenir; yoksa logout + `/login`
6. Başarılı login sonrası `/dashboard`

Refresh token endpointi backend’de henüz yoktur; `utils/tokenRefresh.ts` placeholder’dır.

---

## 6. API entegrasyonu

| Ekran | Endpoint |
|---|---|
| Login | `POST /auth/login` |
| Dashboard cards | `GET /dashboard/summary` |
| Projects DataGrid | `GET /dashboard/projects` (page/size/sort/search/filters) |
| Weekly Reports | `GET /reports`, `GET /reports/{id}` |
| Users | `GET /users` |

Base URL: `VITE_API_BASE_URL` (varsayılan `http://localhost:8080/api/v1`)

CORS: backend `http://localhost:5173` izinli.

---

## 7. Ekranlar

- Login
- Dashboard (özet kartlar)
- Projects (DataGrid: pagination/search/filter/sort)
- Weekly Reports (liste + detay dialog, edit yok)
- Users (liste + search + pagination)
- Settings (oturum özeti)
- 404 Not Found
- 403 Unauthorized

Navigasyon: Dashboard, Projects, Weekly Reports, Users, Settings, Logout

---

## 11. Yeni dashboard tasarım yaklaşımı

GitHub ilhamlı, özgün kurumsal görünüm:

- koyu sidebar + açık içerik
- ince border, düşük gölge
- kompakt kartlar ve label/badge odaklı UI
- ana ekranda kalabalık 12 aylık takvim yok

Palette: sidebar `#0D1B16`, zemin `#F6F8FA`, kart beyaz, border `#D0D7DE`.

---

## 12. Proje kartı mimarisi (ana dashboard)

`ProjectCard` bölümleri:

1. Header: ad, kod, yönetici, status/health badge, son rapor haftası
2. Progress + metrikler (risk/kritik/blocker + bu hafta rapor var/yok)
3. **Kompakt 12 haftalık aktivite şeridi** (`ProjectActivityStrip`)
4. “Detayı Gör” butonu → `/projects/:projectId`

Kart / liste görünümü `localStorage: cto_dashboard_view_mode`.

---

## 13. 12 haftalık aktivite şeridi

- Her hücre = 1 ISO hafta
- Tooltip: yıl/hafta, rapor var/yok, iş kalemi, risk
- Legend: Az → Çok
- Veri yoksa: **“Aktivite verisi bulunmuyor.”**
- Sahte yoğunluk üretilmez

---

## 14. Tam proje aktivite takvimi (yalnızca detay)

Proje detayında “Proje Aktivitesi” bölümü:

- `ProjectActivityCalendar` + `ProjectActivityCell`
- Son 26 hafta, 7 satır günlük grid, yatay scroll
- Model: `ProjectActivityDay` (`date`, `weekNumber`, `reportCount`, `workItemCount`, `riskCount`, `activityCount`, `level`)

---

## 15. Aktivite seviye hesaplama ve veri kaynakları

Seviye:

0 yok · 1 sadece rapor · 2 rapor+iş · 3 rapor+iş+risk · 4 yoğun

Kaynaklar (özel endpoint yok):

- Liste: `latestReportYear/Week`, `hasCurrentWeekReport`, açık risk/blocker sayıları (bilinen rapor haftasına bağlanır)
- Detay: `lastFiveReports.submittedAt` + güncel risk/blocker metrikleri

Boş haftalar/günler 0 kalır. Demo veri gerçek gibi gösterilmez.

---

## 16. Loading / empty / error / responsive / a11y

- Loading: `DashboardSkeleton`, `ProjectCardSkeleton`, strip skeleton
- Empty: proje yok, filtre yok, aktivite yok
- Error: Türkçe mesaj + Tekrar Dene
- Desktop 2 sütun; mobil drawer + tek sütun; şerit yatay scroll
- Badge metinleri, aria-label, klavye focus, tooltip

---

## 17. Rol bazlı hızlı işlemler

`QuickActions` yalnızca mevcut rotalara gider (ADMIN/CTO/PM). Sidebar menü metinleri Türkçe.

---

## 18. Açık kalan backend ihtiyaçları

- Dedicated weekly/daily activity aggregate endpoint
- Work-item/risk update timestamps per week
- Summary trend deltas
- Global search + notifications + refresh token

---

## 8. Çalıştırma

```powershell
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173

Backend’in `http://localhost:8080` üzerinde çalışması gerekir.

---

## 9. Sonraki gün planı (öneri)

- User / Project CRUD formları
- Report create/edit (PM)
- Dedicated activity calendar API
- Health distribution grafikleri
- Refresh token (backend + frontend)

---

## 10. Önerilen commit

```text
feat: redesign dashboard with compact project activity views
```
