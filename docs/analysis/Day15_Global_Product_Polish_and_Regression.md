# Day 15 — Global Product Polish & Regression Pass

**Kapsam:** Frontend-only cilalama. Yeni feature yok.  
**Kısıt:** Backend / API / Entity / DB / business logic değişmedi.  
Bu hâlâ Day 15’tir (Day16 dosya adı kullanılmadı).

---

## 1. Amaç

Ürünü tutarlı, stabil, responsive, erişilebilir ve demo-ready hale getirmek. Day16 bug fix/retest öncesi son polish.

---

## 2. İncelenen ekranlar

Login · Kontrol Paneli · Projeler · Proje Detay · Haftalık Raporlar · Rapor Detay/Create/Edit · Kullanıcılar · Ayarlar · Unauthorized · Not Found · Empty/Error/Skeleton yüzeyleri.

---

## 3. Global design consistency

- `DASH` token genişletildi (`controlHeight`, `pageMaxWidth`, `mutedBg`, …)
- `SurfaceCard` / `PageHeader` / `EmptyState` / `AppErrorState` → token’lara bağlandı
- `ErrorState` → `AppErrorState` wrapper
- Orphan `dashboard/PageHeader` silindi
- `ScheduleStatusBadge` + `RoleBadge` enterprise badge ailesine eklendi
- Çift toast+inline hata (login, report form) sadeleştirildi

---

## 4. Responsive matrix

Kod düzeyinde layout kuralları korundu (sticky tabs md+, mobile action bar, list 1 kolon, filter wrap).  
Gerçek cihaz/DevTools smoke Day16’da manuel doğrulanmalı (1440→390).

| Viewport | Beklenen |
|----------|----------|
| 1440 / 1366 | 8/4 grid, sticky tabs |
| 1024 | sıkışmadan devam |
| 768 | secondary alta, filter wrap |
| 430 / 390 | tek kolon, drawer, yatay overflow yok |

---

## 5. Mobile iyileştirmeler

Mevcut Sprint 3–5 mobile pattern’leri korundu; sticky report submit mobilde ekranı kaplamayacak şekilde sabit alt bar. Yeni büyük layout yazılmadı.

---

## 6. Accessibility

Breadcrumb `aria-label="Sayfa konumu"`, progress aria values, alert role, retry labels, focus-visible (theme). Color-only bilgi badge metniyle destekleniyor.

---

## 7. Language consistency

Kullanıcıya görünen chrome Türkçeleştirildi:

- Dashboard → Kontrol Paneli
- Projects / Users / Settings / Unauthorized / Not Found
- Portfolio / filter / table headers
- Project Detail rail / progress / latest report
- Refresh / Logout butonları

Teknik enum değerleri (ACTIVE, GREEN, CTO) badge label’larıyla gösterilir.

---

## 8. Navigation regression

Route yapısı değişmedi. Breadcrumb/topbar etiketleri güncellendi. `from=dashboard`, report create/edit → detail akışları korundu.

---

## 9. Role regression

UI gating aynı: CTO read-only, ADMIN/PM write, 403 → unauthorized. Frontend security yerine geçmez.

---

## 10. Functional regression

API/hook/mutation değişmedi. 409 mesajı ve form inline alert korundu. Work item / risk CRUD aynı.

---

## 11. Performance

Düşük risk: gereksiz duplicate toast kaldırıldı. Aşırı memoization eklenmedi. Query yapısı aynı.

---

## 12. Lint warning değerlendirmesi

- `ProjectDetailTabs` helpers → `projectDetailTabConfig.ts` taşındı (uyarı giderildi)
- `useAuth` → `hooks/useAuth.ts`; AuthContext uyumluluk re-export’unda eslint-disable
- npm `devdir` → ortam/npm uyarısı; uygulama kodu değil

---

## 13. Build / lint sonuçları

- `npm run build` — başarılı
- `npm run lint` — 0 error / 0 warning
- npm `devdir` ortam uyarısı uygulama kodundan değil

---

## 14. Açık kalan sorunlar

- Login ekranı hâlâ auth-island (koyu gradient); bilinçli ayrı yüzey
- Users DataGrid (liste dili enterprise değil ama TR + surface)
- Schedule filtre API’de yok (rapor listesi sayfa-içi)
- Router-level unsaved changes blocker yok
- Orphan legacy component dosyaları (kullanılmayan) temizlenmedi

---

## 15. Day16’ya devredilecek gerçek buglar

1. Manuel responsive smoke (tüm viewport matrisi)
2. Rol bazlı uçtan uca QA (ADMIN / CTO / PM)
3. 409 duplicate → mevcut rapor deep-link (reportId yoksa liste filtresi)
4. Orphan component cleanup
5. Users/Settings advanced features (CRUD/settings) — ürün kapsamı
