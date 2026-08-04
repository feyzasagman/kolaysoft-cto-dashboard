# Kolaysoft CTO Dashboard

## 12. Gün React Frontend Kurulum Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — React Frontend Setup |
| Tarih | 4 Ağustos 2026 |
| Sürüm | 1.3 |
| Durum | Day 12 + enterprise SaaS dashboard redesign |
| Kapsam dışı | Backend değişikliği, DB, JWT server tarafı, AI, bildirimler |

---

## 1. Günün amacı

Mevcut Spring Boot API’yi tüketen React frontend iskeletini kurmak: auth, layout, routing, API client, temel ekranlar. Ardından dashboard’u Primer / Linear / modern MUI ilhamlı, özgün kurumsal SaaS arayüzüne taşımak.

---

## 2. Teknoloji yığını

| Kütüphane | Amaç |
|---|---|
| React 18 + Vite + TypeScript | UI / build |
| React Router | Routing + protected routes |
| Axios | HTTP client |
| TanStack Query | Server state |
| Material UI | UI / tablolar / shell |
| React Hook Form + Zod | Form validation |
| React Toastify | Kullanıcı bildirimleri |

---

## 3. Klasör yapısı

```text
frontend/
  src/
    api/           # Axios instance + interceptors
    assets/        # Statik varlıklar
    components/
      common/      # EmptyState, ErrorState, StatusBadges
      dashboard/   # KPI, table, panels, activity, skeleton
    contexts/      # AuthContext
    hooks/         # React Query hooks
    layouts/       # AppShell, Sidebar, Topbar
    pages/
      login/
      dashboard/
      projects/
      reports/
      users/
      common/      # Settings, 404, 403
    routes/        # AppRouter, ProtectedRoute
    services/      # API service fonksiyonları
    theme/         # Enterprise MUI theme
    types/         # API DTO tipleri
    utils/         # tokenStorage, activity, labels
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
- Layout: `AppShell` (Sidebar + Topbar + max-width Outlet)
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
| KPI özeti | `GET /dashboard/summary` |
| Sağlık dağılımı | `GET /dashboard/health-distribution` |
| Kritik riskler | `GET /dashboard/critical-risks` |
| Proje tablosu | `GET /dashboard/projects` (page/size/sort/search/filters) |
| Proje detay | `GET /dashboard/projects/{id}` |
| Weekly Reports | `GET /reports`, `GET /reports/{id}` |
| Users | `GET /users` |

Base URL: `VITE_API_BASE_URL` (varsayılan `http://localhost:8080/api/v1`)

CORS: backend `http://localhost:5173` izinli. Backend endpoint sözleşmesi değiştirilmedi.

---

## 7. Ekranlar

- Login
- Dashboard (enterprise SaaS layout)
- Projects
- Project Detail (tam aktivite takvimi)
- Weekly Reports (liste + detay dialog, edit yok)
- Users (liste + search + pagination)
- Settings (oturum özeti)
- 404 Not Found
- 403 Unauthorized

---

## 8. Enterprise SaaS redesign — zayıf noktalar (öncesi)

Tespit edilen görsel / IA zayıflıkları:

- Kart ağırlıklı ana görünüm, tablo yoğunluğundan uzak
- `health-distribution` ve `critical-risks` API’leri frontend’de kullanılmıyordu
- Breadcrumb / max content width yoktu
- Altı dağınık KPI yerine dört odaklı metrik ihtiyacı
- Ağır gölge / kart şişkinliği riski; takvim ana ekranı şişiriyordu

---

## 9. Tasarım kararları

| Karar | Uygulama |
|---|---|
| İlham | Primer / Linear / modern MUI — kopya değil, özgün nötr palet |
| Yoğunluk | İnce 1px border, gölgesiz yüzeyler, 8px spacing |
| Shell | Sabit koyu sidebar (`#0D1117`), sticky topbar, içerik max `1440px` |
| Tipografi | IBM Plex Sans; başlık ~28px, metrik ~28px, body 14px, secondary 12–13px |
| Renk | Zemin `#F6F8FA`, yüzey beyaz, aksan `#0969DA`; success/warning/critical anlamlı kullanım |
| KPI | 4 kart: Active / At Risk / Critical Risks / Missing Weekly Reports |
| Tablo | GitHub repo-list yoğunluğu, sticky header, hover, status chip, progress, kompakt strip |
| Aktivite | Ana ekran: 12 haftalık strip; detay: 26 haftalık contribution takvimi |
| Veri dürüstlüğü | Aktivite yalnızca mevcut alanlardan; yoksa “Aktivite verisi bulunmuyor.” |
| Responsive | Desktop 2 kolon; tablet stacked; mobil drawer + yatay scroll tablo |
| A11y | focus-visible, aria-label, renk + metin badge, klavye tooltip |

---

## 10. Bileşen yapısı

- `AppShell` — shell + `cto:refresh` event
- `Sidebar` — gruplu menü, rol, logout
- `Topbar` — breadcrumb, arama, yenile, profil
- `PageHeader` — başlık, açıklama, dönem seçici
- `KpiCard` — beyaz yüzey, ikon, metrik, secondary
- `HealthDistributionPanel` — bar dağılımı
- `CriticalRisksPanel` — kritik risk listesi
- `FilterBar` — arama + filtreler
- `ProjectTable` — sıralama, seçim, strip, aksiyon
- `SelectedProjectPanel` — seçili proje aktivitesi
- `ProjectActivityStrip` / `ProjectActivityCalendar`
- `EmptyState` / `ErrorState` / `DashboardSkeleton`
- `QuickActions` — role göre kısayollar

---

## 11. Dashboard bilgi mimarisi

1. Page header + dönem etiketi (mevcut ISO hafta; backend tarih filtresi yok)
2. Dört KPI (`summary`)
3. Sağlık dağılımı + kritik riskler (2 kolon)
4. FilterBar + ProjectTable + SelectedProjectPanel
5. QuickActions

Topbar Yenile → `window` `cto:refresh` → tüm dashboard sorguları refetch.

---

## 12. 12 haftalık aktivite şeridi

- Her hücre = 1 ISO hafta; tablo satırında `compact` mod
- Tooltip: yıl/hafta, rapor, iş kalemi, risk
- Sahte yoğunluk üretilmez

---

## 13. Tam proje aktivite takvimi (yalnızca detay)

- `ProjectActivityCalendar` + `ProjectActivityCell`
- Son 26 hafta; özel aggregate endpoint yok

---

## 14. Loading / empty / error / responsive / a11y

- Loading: layout’a uyan `DashboardSkeleton`
- Empty: ilk kullanım vs filtre sonucu ayrımı (+ filtre temizle)
- Error: Türkçe + Tekrar Dene
- Desktop sidebar; tablet/mobil drawer; sayfa yatay taşması yok

---

## 15. Açık kalan backend ihtiyaçları

- Dedicated weekly/daily activity aggregate endpoint
- Work-item/risk update timestamps per week
- Summary trend deltas
- Gerçek tarih aralığı filtresi + refresh token

---

## 16. Çalıştırma

```powershell
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173 — Backend: http://localhost:8080

Doğrulama: `npm run build`, `npm run lint` (0 error).

---

## 17. Önerilen commit

```text
feat: redesign dashboard as polished enterprise SaaS interface
```
