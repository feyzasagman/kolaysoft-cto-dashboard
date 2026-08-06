# Kolaysoft CTO Dashboard

## 14. Gün — Dashboard Proje Detayı, Temel Filtreler ve Uçtan Uca Entegrasyon

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu |
| Tarih | 6 Ağustos 2026 |
| Sürüm | 1.0 |
| Durum | Day 14 frontend tamamlandı |
| Kapsam dışı | Yeni backend endpoint, AI/bildirim/export/audit, contribution calendar, Day 15 test raporu |

---

## 1. Günün amacı

Dashboard’dan proje detayına gerçek geçişi tamamlamak; temel filtreleri, sayfalama/sıralamayı ve loading/empty/error durumlarını API’ye bağlayarak uçtan uca akışı çalıştırmak.

---

## 2. Yönetmelikteki 14. gün hedefi

- Dashboard → proje detay geçişi
- Temel filtrelerin API’ye bağlanması
- Loading, empty ve error doğrulaması
- Özetten detaya gerçek uçtan uca akış

---

## 3. Mevcut sistem durumu

- Spring Boot + PostgreSQL + JWT hazır
- Day 13: KPI, sağlık dağılımı, portföy tablosu gerçek API ile çalışıyor
- Day 12: haftalık rapor / iş kalemi / risk frontend akışları mevcut
- Bu günde yeni backend endpoint üretilmedi; mevcut sözleşmeler kullanıldı

---

## 4. Dashboard–proje detay akışı

1. ADMIN/CTO `/dashboard` açar
2. Filtre / sayfalama / sıralama URL query’de tutulur
3. Portföy satırında **Detayı Gör** → `/projects/:projectId?from=dashboard&…filtreler`
4. Detay sayfası `GET /dashboard/projects/{id}` ile yüklenir
5. **Geri Dön** / breadcrumb → `/dashboard` + korunan query parametreleri

Geçersiz ID → 404 empty state. Atanmamış PM → 403 → `/unauthorized`.

---

## 5. Proje detay bilgi mimarisi

Kaynak önceliği: `GET /api/v1/dashboard/projects/{projectId}`

Zenginleştirme (ikincil; kritik path’i tek başına düşürmez):

| Veri | Endpoint |
|---|---|
| Son rapor metin alanları | `GET /reports/{reportId}` |
| Risk listesi | `GET /risks?reportId=` (son rapor) |
| İş kalemleri | `GET /work-items?reportId=` (son rapor) |
| Rapor geçmişi ID eşlemesi | `GET /reports/project/{projectId}` |

Bileşen sırası:

1. ProjectDetailHeader (breadcrumb + aksiyonlar)
2. ProjectInfoCard + ProjectProgressSummary
3. LatestReportPanel
4. ProjectRiskSummary + ProjectWorkItemSummary
5. ReportHistoryPanel

---

## 6. Temel proje bilgileri

Gösterilen alanlar: ID, kod, ad, müşteri, açıklama, yönetici, tarihler, durum, son rapor tarihi, mevcut hafta raporu var/yok.

Null → `—` veya anlamlı boş metin. Enum/tarih Türkçe etikete çevrilir.

**Not:** `customer` backend `ProjectDashboardDetail` DTO’sunda yok → UI `—`.

---

## 7. İlerleme karşılaştırması

`ProjectProgressSummary`:

- Hedeflenen / gerçekleşen (0–100 clamp)
- Fark metni (+/− puan / Hedefte)
- Progress bar + `aria-valuenow`
- Sağlık badge
- Takvim durumu (rapor zenginleştirmeden; Türkçe etiket)

Gerçekleşen < hedef → uyarı rengi + metin; aksi halde olumlu.

---

## 8. Son haftalık rapor

`LatestReportPanel`:

- Yıl/hafta, tarih, sağlık, ilerleme, durum, risk/blocker sayıları
- Yapılanlar / yapılacaklar / genel not (`GET /reports/{id}` ile)
- **Raporu Görüntüle**
- Rapor yoksa: “Bu proje için henüz haftalık rapor bulunmuyor.”
- PM (kendi projesi) / ADMIN: **Haftalık Rapor Oluştur**
- CTO: salt okunur (oluşturma gizli)

---

## 9. Risk ve engel özeti

`ProjectRiskSummary`:

- Açık risk / blocker sayıları (detay DTO)
- Açık/In Progress riskler, max 5
- Başlık, seviye, durum, aksiyon planı, rapor linki
- Boş: “Bu proje için açık risk veya engel bulunmuyor.”
- “Daha Fazla Gör” eklenmedi (ayrı liste route yok)

---

## 10. İş kalemi özeti

`ProjectWorkItemSummary`:

- `DONE` olmayan kayıtlar, max 5
- Başlık, sorumlu, durum, plan/tamamlanma, not, rapor linki
- Boş: “Bu proje için aktif iş kalemi bulunmuyor.”

---

## 11. Rapor geçmişi

`ReportHistoryPanel`:

- `lastFiveReports` + `GET /reports/project/{id}` ile `reportId` eşlemesi
- En yeni üstte
- Detay butonu yalnızca ID bulunduğunda

**API boşluğu:** history DTO’da `reportId` yok; eşleme yıl+hafta üzerinden yapılır.

---

## 12. Temel dashboard filtreleri

`DashboardFilterBar` + `dashboardFilterMapper`:

| UI filtresi | API parametresi |
|---|---|
| Ara | `search` |
| Durum | `projectStatus` |
| Sağlık | `health` (GREEN/YELLOW/RED) |
| Bu hafta rapor | `hasCurrentWeekReport` |
| Yönetici | `managerId` |
| Risk seviyesi | `riskLevel` |
| Sıralama | `sort` |
| Sayfa boyutu | `size` |

“Rapor Yok” sağlık enum’u olarak gönderilmez; `hasCurrentWeekReport=false` kullanılır.

Filtre değişince `page=0`. **Filtreleri Temizle** varsayılana döner. Search ~350ms debounce (ek kütüphane yok).

---

## 13. URL query state yaklaşımı

- Session/localStorage kullanılmaz
- Sayfa yenilemede filtreler korunur
- Detay linki: mevcut filtreler + `from=dashboard`
- Geri dönüşte aynı query restore edilir

---

## 14. Sayfalama

- Varsayılan: `page=0`, `size=20`
- Seçenekler: 10 / 20 / 50
- `totalElements` / `totalPages` backend PageResponse’tan
- URL’de `page` / `size` korunur

---

## 15. Sıralama

Backend allowlist: `name`, `code`, `status`, `createdAt`, `id`

UI seçenekleri yalnızca bu alanlara map edilir.

**Desteklenmeyen (istenmiş ama API yok):** son rapor tarihi, gerçekleşen ilerleme, açık risk sayısı — sıralama seçeneği olarak eklenmedi.

---

## 16. Rol bazlı erişim

| Rol | Dashboard portföy | Proje detay | Aksiyonlar |
|---|---|---|---|
| ADMIN | Tüm projeler | Evet | Rapor oluştur (edit project route yok → buton yok) |
| CTO | Tüm projeler | Evet | Salt okunur; rapor görüntüleme açık |
| PROJECT_MANAGER | Genel dashboard 403 | Yalnızca atanmış proje | Kendi projesinde rapor oluştur |

Frontend buton gizleme güvenlik yerine geçmez; 403 Navigate `/unauthorized`.

---

## 17. Loading state

- Dashboard ilk yükleme: `DashboardSkeleton`
- Filtre refetch: tablo üzerinde ince progress (`ProjectPortfolioTable` loading)
- Detay: `ProjectDetailSkeleton` (header + kartlar)

---

## 18. Empty state

| Durum | Mesaj | Aksiyon |
|---|---|---|
| Filtre sonucu boş | Filtrelere uygun proje bulunamadı. | Filtreleri Temizle |
| Proje 404 / geçersiz ID | Proje bulunamadı. | Dashboard’a Dön |
| Son rapor yok | Bu proje için henüz haftalık rapor bulunmuyor. | (PM/Admin) Oluştur |
| Risk yok | Bu proje için açık risk veya engel bulunmuyor. | — |
| İş kalemi yok | Bu proje için aktif iş kalemi bulunmuyor. | — |
| Geçmiş yok | Rapor geçmişi bulunmuyor. | — |

---

## 19. Error ve retry

- `ProjectDetailErrorState` / `DashboardErrorState`: `role="alert"`, Tekrar Dene
- 401 → mevcut login interceptor
- 403 → unauthorized
- 404 → empty
- 500/network → retry (ham Axios mesajı gösterilmez)

---

## 20. Responsive kararlar

- Desktop: detay iki kolon (bilgi + ilerleme; risk + iş kalemi)
- Tablet/mobil: tek kolon; filtreler satır kırılır; tablo horizontal scroll
- Breadcrumb sıkışmasını önlemek için caption tipografi

---

## 21. Accessibility

- Breadcrumb `aria-label`
- Tablo başlıkları, filtre label’ları
- Progress `aria-valuenow` / min / max
- Loading `aria-busy` / `aria-label`
- Error `role="alert"`
- Badge metinleri mevcut StatusBadges bileşenlerinde

---

## 22. Kullanılan endpointler

- `GET /api/v1/dashboard/projects`
- `GET /api/v1/dashboard/projects/{projectId}`
- `GET /api/v1/dashboard/summary` (mevcut)
- `GET /api/v1/dashboard/health-distribution` (mevcut)
- `GET /api/v1/dashboard/critical-risks` (mevcut)
- `GET /api/v1/reports/{id}`
- `GET /api/v1/reports/project/{projectId}`
- `GET /api/v1/work-items?reportId=`
- `GET /api/v1/risk-issues?reportId=` (veya mevcut risk path)
- `GET /api/v1/users?role=PROJECT_MANAGER` (yönetici filtresi)

Yeni endpoint eklenmedi.

---

## 23. Test senaryoları

Otomatik unit test kütüphanesi eklenmedi (kapsam dışı). Manuel / API senaryoları:

1. Filtre parametreleri API’ye gider
2. Filtre → page 0
3. Filtreleri temizle
4. Pagination
5. Sort allowlist
6. Detayı Gör route + query
7. Detay veri render
8–11. Son rapor / risk / iş kalemi / geçmiş
12–14. Loading / 404 / error+retry
15–18. Rol erişimi
19. URL state koruma
20. Mobil layout gözle kontrol

---

## 24. Gerçek test sonuçları

| Senaryo | Sonuç |
|---|---|
| `npm run build` | Başarılı |
| `npm run lint` | Başarılı (önceden var olan 2 warning) |
| Postgres Docker | `cto-dashboard-postgres` yeniden başlatıldı |
| ADMIN login | 200 / success |
| Portföy listesi | `totalElements=2` |
| Proje detay (id=2) | 200; `openRisks=1`, `reportHistoryCount=3`, `latestReport.reportId=4` |
| Filtre `projectStatus=ACTIVE` | `totalElements=2` |
| Filtre `health=GREEN` | `totalElements=1` |
| Filtre `hasCurrentWeekReport=false` | `totalElements=2` |
| Geçersiz proje 999999 | HTTP 404 |
| Work items (reportId=4) | `totalElements=1` |
| Risks (reportId=4) | `totalElements=1` |
| Reports by project | `totalElements=3` |
| CTO / PM canlı UI | Seed kullanıcıya bağlı; rol mantığı kodda uygulandı |
| Frontend unit test | Yok (kütüphane eklenmedi) |

---

## 25. Bulunan hatalar

1. Login 500 — Postgres container `Exited` iken backend ayaktaydı
2. Sıralama: istenen bazı alanlar backend allowlist’te yok
3. `customer` DTO’da yok
4. History’de `reportId` yok → ek çağrı gerekir
5. Sağlık “Rapor Yok” `health` enum değil → `hasCurrentWeekReport` ile çözüldü

---

## 26. Yapılan düzeltmeler

1. Postgres container yeniden başlatıldı; API tekrar doğrulandı
2. Sort UI yalnızca allowlist alanlarına bağlandı
3. Customer için dürüst `—` gösterimi
4. History ID eşlemesi `useProjectReports` ile
5. Rol aksiyonları sadeleştirildi (CTO view; PM own create)
6. Breadcrumb: Dashboard > Projeler > {ad}
7. Takvim durumu Türkçe etiket

---

## 27. Tekrar test sonuçları

Postgres start sonrası ADMIN akışı (login → filtre → detay → 404 → work/risk/report) başarıyla doğrulandı. Build ve lint temiz.

---

## 28. Açık kalan noktalar

- Backend sort alanlarının genişletilmesi (ilerleme, risk, son rapor tarihi)
- `customer` alanının DTO’ya eklenmesi
- History DTO’ya `reportId`
- PM için dashboard proje listesi (hâlâ 403; Day 12 workaround)
- Otomatik FE test altyapısı
- Proje düzenleme route’u yok → ADMIN “Projeyi Düzenle” butonu yok

---

## 29. 15. gün test turu planı

1. ADMIN/CTO/PM için uçtan uca checklist (filtre → detay → geri)
2. 401/403/404/500 matrisinin ekran kayıtlarıyla doğrulanması
3. Regression: Day 12 rapor/iş/risk + Day 13 KPI
4. Bilinen API boşluklarının kabul / takip kararı
5. Day 15 test raporu dokümantasyonu
