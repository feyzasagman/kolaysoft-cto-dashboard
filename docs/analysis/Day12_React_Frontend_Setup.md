# Kolaysoft CTO Dashboard

## 12. Gün React Frontend Kurulum Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — React Frontend Setup |
| Tarih | 4 Ağustos 2026 |
| Sürüm | 1.0 |
| Durum | Day 12 tamamlandı |
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
- Dashboard grafik / health distribution
- Refresh token (backend + frontend)
- Role-aware empty states ve izin UI iyileştirmeleri

---

## 10. Önerilen commit

```text
feat: initialize React frontend architecture
```
