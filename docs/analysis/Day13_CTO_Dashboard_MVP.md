# Kolaysoft CTO Dashboard

## 13. Gün — CTO Dashboard MVP

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu |
| Tarih | 6 Ağustos 2026 |
| Sürüm | 1.0 |
| Durum | Day 13 MVP tamamlandı (frontend) |
| Kapsam dışı | Backend değişikliği, gelişmiş filtreler, proje detay uçtan uca, contribution calendar, AI/bildirim/export |

---

## 1. Günün amacı

CTO Dashboard MVP’nin profesyonel, veri odaklı frontend temelini oluşturmak: KPI kartları, sağlık dağılımı ve proje portföy tablosu.

---

## 2. Yönetmelikteki 13. gün hedefi

- Dashboard kartları
- Proje tablosu
- Sağlık göstergeleri
- Mevcut dashboard özet endpointlerinin doğru UI dönüşümü

---

## 3. Mevcut sistem durumu

- Spring Boot dashboard endpointleri hazır (Day 10+)
- React login, rapor/iş kalemi/risk akışı mevcut (Day 12)
- Bu günde dashboard sayfası MVP düzenine çekildi
- Sahte veri kullanılmadı

---

## 4. Dashboard bilgi mimarisi

Sıra:

1. DashboardHeader (rol başlığı, karşılama, yenile)
2. Primary KPI Cards (6)
3. Health Distribution + Critical Risks Preview
4. Project Portfolio Table
5. Quick Actions

---

## 5. KPI kartları

Kaynak: `GET /dashboard/summary`

| Kart | Alan |
|---|---|
| Toplam Proje | `totalProjects` |
| Aktif Proje | `activeProjects` |
| Tamamlanan Proje | `completedProjects` |
| Açık Risk | `openRisks` |
| Kritik Risk | `criticalRisks` |
| Eksik Haftalık Rapor | `projectsWithoutCurrentWeekReport` |

Beyaz yüzey, 1px border, ikon vurgusu; tam kart boyama yok.

---

## 6. Health distribution

Kaynak: `GET /dashboard/health-distribution`

- GREEN → Sağlıklı
- YELLOW → Dikkat
- RED → Kritik
- NO_REPORT → Rapor Yok

Yatay progress bar + sayı + yüzde. Toplam 0 ise boş mesaj; bölme hatası yok.

---

## 7. Project portfolio table

Kaynak: `GET /dashboard/projects`

Sütunlar: Proje, Kod, Yönetici, Durum, Sağlık, İlerleme (hedef/gerçek), Açık Risk, Kritik Risk, Mevcut Hafta Raporu, Son Rapor Tarihi, Detayı Gör.

Gelişmiş filtreler Day 14’e bırakıldı; temel sayfalama var.

---

## 8. Status ve health badge yaklaşımı

- `ProjectStatusBadge` / `HealthBadge` / `ReportAvailabilityBadge`
- Metin + renk birlikte
- Küçük, border’lı chip

---

## 9. API veri dönüşümü

`utils/dashboardMapper.ts`:

- null → güvenli sayı / yüzde clamp
- KPI / health / portfolio satır modelleri
- Türkçe etiketler `labels.ts` üzerinden

Component içinde ham DTO işlenmez.

---

## 10. Rol bazlı dashboard davranışı

| Rol | Davranış |
|---|---|
| CTO | Genel bakış, read-only portföy |
| ADMIN | Genel bakış + hızlı yönetim linkleri |
| PROJECT_MANAGER | Route/API 403; `/unauthorized` (genel dashboard yok) |

---

## 11. Loading state

`DashboardSkeleton`: header + 6 KPI + health/risk + tablo iskeleti.

---

## 12. Empty state

- Proje yok: “Henüz proje bulunmuyor”
- Health toplam 0: “Sağlık dağılımı için yeterli veri bulunmuyor.”
- Kritik risk yok: metin empty

---

## 13. Error state

`DashboardErrorState` + Tekrar Dene; ham Axios mesajı yok; 403 → unauthorized.

---

## 14. Responsive kararlar

- KPI: xs 1 / sm 2 / lg 3 sütun
- Health + risks: lg 2 kolon, mobil stacked
- Tablo: yatay scroll
- Header: mobil alt alta

---

## 15. Accessibility kararları

- Yenile `aria-label`
- Badge metinleri
- Progress `aria-label`
- Error `role="alert"`
- Skeleton `aria-busy`

---

## 16. Kullanılan endpointler

| Endpoint | Rol |
|---|---|
| `GET /dashboard/summary` | ADMIN, CTO |
| `GET /dashboard/health-distribution` | ADMIN, CTO |
| `GET /dashboard/critical-risks` | ADMIN, CTO |
| `GET /dashboard/projects` | ADMIN, CTO |

---

## 17. Test senaryoları

Frontend unit test kütüphanesi yok; doğrulama: build/lint + kod incelemesi + (mümkünse) canlı API.

---

## 18. Gerçek test sonuçları

Tarih: 6 Ağustos 2026

| Kontrol | Sonuç |
|---|---|
| `npm run build` | Başarılı |
| `npm run lint` | 0 error |
| Canlı API (ADMIN/CTO dashboard) | Backend/Docker bu oturumda kapalı — canlı yeniden test edilemedi |
| Endpoint sözleşmesi | Day 10/12 ile birebir eşleşiyor (DTO alanları doğrulandı) |
| PM erişimi | Route guard + query `enabled=false` |

---

## 19. Karşılaşılan sorunlar

1. Eski dashboard 4 KPI (English) Day 13 setinden farklıydı
2. `DashboardHeader` kullanılmıyordu
3. Hooks rules: PM redirect hook’lardan önce olamazdı → düzeltildi
4. Canlı Docker/backend bu günde kapalı

---

## 20. Yapılan düzeltmeler

- 6 Türkçe KPI + mapper
- Portfolio table + badge’ler
- Rol başlıkları + yenile
- Skeleton / error / empty
- Query `enabled` ile PM’ye gereksiz 403 çağrı engeli

---

## 21. Açık kalan noktalar

- Gelişmiş filtreler / arama (Day 14)
- Proje detay uçtan uca entegrasyon
- Canlı manuel UI doğrulama (backend açıkken)
- Unit test altyapısı yok

---

## 22. 14. gün planı

1. Proje detayına uçtan uca geçiş
2. Temel filtreler (status, health, missing report)
3. Pagination/sort iyileştirmeleri
4. Loading/error detayları
5. Dashboard–proje detay entegrasyonu

---

## Önerilen commit

```text
feat: implement CTO dashboard MVP portfolio view
```
