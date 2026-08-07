# Day 16 — Dashboard Enterprise Redesign (Sprint 1)

**Kapsam:** Yalnızca Dashboard ekranı ve paylaşılan badge/token’lar.  
**Kısıt:** Backend / API / Entity / DB / yeni business logic yok.

---

## 1. Yapılan UI değişiklikleri

- Kurumsal **Dashboard Header**: breadcrumb, sayfa başlığı, alt açıklama, karşılama, `Last updated …`, Refresh.
- **KPI kartları** eşit yükseklikte (min 148px), 3×2 grid, ikon + başlık + büyük sayı + açıklama + trend + hover/shadow.
- **Layout:** Header → KPI → Health | Recent Reports → Filters + Portfolio → Recent Risks.
- **Health Distribution:** renk noktası, isim, yüzde, sayı, progress satırları; premium surface.
- **Project Portfolio:** GitHub repo listesi tarzı kolonlar (Name, Code, Manager, Health, Status, Progress, Last Report, Updated, Actions).
- **Badge’ler:** pastel arka plan, soft border, rounded, ortak `EnterpriseBadge` stili.
- **Filtreler:** chip hızlı seçim, aktif border/renk, “Filtreleri Temizle”.
- **Skeleton:** header / KPI / panels / filters / table gerçek layout ölçüleriyle hizalı.
- Spacing token’ları: `theme/dashboardTokens.ts` (8 / 16 / 24 / 32).

---

## 2. UX kararları

| Karar | Gerekçe |
|--------|---------|
| Başlık sabit “Dashboard” | Demo ve mülakatta tutarlı ilk izlenim |
| Karşılama yalnızca ilk ad | Daha kişisel, daha az kalabalık |
| Recent Activity / Quick Actions kaldırıldı (dashboard’dan) | Sprint 1 grid’i sade; dikkat KPI + portföyde |
| Recent Reports mevcut portföy verisinden | Yeni endpoint yok |
| Yeşil/kırmızı/turuncu yalnızca semantik | Enterprise renk disiplini |

---

## 3. Responsive iyileştirmeleri

- KPI: 1 → 2 → 3 kolon.
- Health/Reports: tek kolon (mobile) / iki kolon (lg+).
- Tablo: Code / Last Report / Updated / Manager adı breakpoint’lere göre gizlenir; yatay scroll korunur.
- Header aksiyonları mobile’da full-width.

---

## 4. Component değişiklikleri

| Dosya | Değişiklik |
|--------|------------|
| `DashboardPage.tsx` | Sprint 1 grid |
| `DashboardHeader.tsx` | Surface header + breadcrumb |
| `KpiCard.tsx` / `DashboardSummary.tsx` | Eşit yükseklik, 3×2 |
| `HealthDistributionPanel.tsx` | Premium satır dağılımı |
| `RecentReportsPanel.tsx` | Token’lı surface |
| `CriticalRisksPanel.tsx` | Full-width recent risks |
| `ProjectPortfolioTable.tsx` | Repo-list kolonları |
| `DashboardFilterBar.tsx` | Chip + clear UX |
| `DashboardSkeleton.tsx` | Layout-matched |
| `StatusBadges.tsx` | Enterprise badge sistemi |
| `dashboardTokens.ts` | Spacing / surface |
| `dashboardMapper.ts` | Header copy |

---

## 5. Accessibility

- Header `aria-live` ile last updated.
- KPI trend `aria-label`.
- Filter clear / row actions / refresh `aria-label`.
- Progress bar `aria-valuenow` / label.
- Badge’ler açıklayıcı `aria-label`.
- Focus-visible tema seviyesinde korundu.

---

## 6. Performans

- Yeni network çağrısı yok.
- `portfolioRows` `useMemo`.
- Progress hücresi `memo`.
- Filtre araması 350ms debounce.

---

## 7. Kullanılan tasarım prensipleri

1. **Hierarchy first** — başlık → KPI → içerik → risk.
2. **Whitespace as structure** — 32px section gap.
3. **Border over noise** — hafif shadow, kalın glow yok.
4. **Semantic color only** — başarı / uyarı / kritik.
5. **Scanability** — kalın proje adı, gri kod, avatar, badge, progress.
6. **Demo-ready density** — CTO’nun günlük tarayacağı netlik.

---

## 8. Screenshot önerileri

1. Dashboard dolu veri (desktop 1440)
2. Sidebar collapsed + Dashboard
3. Filtre aktif + chip’ler
4. Empty portfolio
5. Mobile 375 — KPI stack + table scroll
