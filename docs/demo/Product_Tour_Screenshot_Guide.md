# Product Tour — Screenshot Guide

README **Ürün Turu** görsellerinin yeniden üretimi için kısa rehber.

## Ortam

Tercih edilen hedef:

| Katman | URL |
| --- | --- |
| Frontend (Docker / nginx) | `http://localhost:3000` |
| API (doğrudan veya proxy) | `http://localhost:8080/api/v1` veya same-origin `/api/v1` |

Stack:

```bash
docker compose --env-file .env.docker.example up -d --build
```

Capture sırasında Playwright `E2E_BASE_URL` ile FE’ye, `E2E_API_BASE_URL` ile API discovery’ye bağlanır.

Örnek (PowerShell):

```powershell
cd frontend
$env:E2E_BASE_URL = 'http://localhost:3000'
$env:E2E_API_BASE_URL = 'http://localhost:8080/api/v1'
npm run capture:screenshots
```

Vite (`:5173`) de kullanılabilir; README’deki görseller Docker `:3000` ile üretilmiştir.

## Viewport

- `1440 × 900`
- `deviceScaleFactor: 1`
- Page viewport screenshot (browser chrome yok)
- `fullPage: false`

Config: `frontend/playwright.capture.config.ts`  
Bu config `npm run test:e2e` suite’ine dahil değildir.

## Credentials

`frontend/.env.e2e` (commit edilmez; bkz. `.env.e2e.example`):

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `E2E_ADMIN_PASSWORD` | Evet | Dev seed ADMIN şifresi |
| `E2E_ADMIN_EMAIL` | Hayır | Varsayılan `admin@kolaysoft.com.tr` |
| `E2E_PM_EMAIL` / `E2E_PM_PASSWORD` | Hayır | Haftalık rapor için PM; yoksa journey-state veya `demo-pm@example.test` |

Şifre script içine hard-code edilmez.

## Gerekli demo data

Capture yeni ürün verisi üretmek zorunda değildir; mevcut demo ile çalışır. İdeal portföy:

- En az **2 proje**
- **GREEN** + **YELLOW** sağlık
- Dolu haftalık rapor (completed / planned work)
- Risk / work item (YELLOW projede tercih)
- ADMIN (+ PM login için PROJECT_MANAGER)

Day 19 demo verisi (Docker volume korunmuşsa) bu koşulları sağlar.

Eksik ekran / boş sayfa → script **fail** eder; sahte PNG yazılmaz.

## Dosya eşlemesi

| Dosya | Ekran | Rol |
| --- | --- | --- |
| `docs/assets/screenshots/01-dashboard.png` | Kontrol Paneli | ADMIN |
| `docs/assets/screenshots/02-project-portfolio.png` | Projeler / Portföy | ADMIN |
| `docs/assets/screenshots/03-project-detail.png` | Project Detail (YELLOW tercih) | ADMIN |
| `docs/assets/screenshots/04-executive-insight.png` | Yönetici Özeti odaklı scroll | ADMIN |
| `docs/assets/screenshots/05-weekly-report.png` | Haftalık rapor detay | PROJECT_MANAGER |
| `docs/assets/screenshots/06-team-management.png` | Proje → Ekip sekmesi | ADMIN |
| `docs/assets/screenshots/07-admin-users.png` | Kullanıcılar | ADMIN |

`08-ci-quality-gate.png` otomatik üretilmez (GitHub Actions UI). Manuel eklenecekse README’ye ayrıca referans verin.

## Capture komutu

```bash
cd frontend
npm run capture:screenshots
```

Script: `frontend/scripts/capture-product-tour.ts`  
Çıktı klasörü yoksa oluşturulur; aynı dosya adları üzerine yazılır.

## Yeniden capture

1. Docker (veya local) stack ayakta olsun.
2. GREEN/YELLOW + dolu rapor doğrulansın.
3. `frontend/.env.e2e` doldurulsun.
4. `E2E_BASE_URL` / `E2E_API_BASE_URL` ayarlanıp `npm run capture:screenshots` çalıştırılsın.
5. PNG boyutlarını ve hassas veri olmadığını gözle kontrol edin.

## Hassas veri

Screenshot’ta olmamalı: JWT, password, gerçek çalışan e-postası, müşteri secret’ı, DevTools.  
Demo hesaplar (`@example.test`, `admin@kolaysoft.com.tr`) kabul edilir.
