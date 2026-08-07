# Day 15 — Project Portfolio Enterprise Redesign (Sprint 3)

**Kapsam:** `/projects` portföy ekranı (ADMIN/CTO + PM liste deneyimi).  
**Kısıt:** Backend / API / Entity / DB / business logic değişmedi.

> Dosya adı talep üzerine `Day15_…` tutulmuştur (Dashboard Sprint 1: `Day16_…`, Detail Sprint 2: `Day15_Project_Detail_…`).

---

## 1. Yapılan UI değişiklikleri

- DataGrid kaldırıldı → **GitHub Repository tarzı liste**.
- **Header:** Projects, toplam / aktif sayı, son güncelleme, Refresh, Yeni Proje (placeholder), Export (placeholder).
- **Filter bar:** Search, Status, Health, Manager, Week, Sort — aktif filtre chip’leri + Clear Filters.
- **Satır:** Name (kalın), Code (gri), Manager avatar, Status/Health/Report badge, ince progress, last report, updated, quick actions (View / Edit / Reports / More).
- **Skeleton:** Gerçek satır yüksekliğinde repo-list skeleton.
- **Empty state:** ikon + başlık + açıklama + CTA.
- PM kart grid’i aynı liste satırına taşındı.

---

## 2. UX kararları

| Karar | Gerekçe |
|--------|---------|
| Liste > kart | CTO tarama hızı; GitHub/Linear hissi |
| Yeni Proje toast placeholder | Create UI/route yok; uydurma form yok |
| Edit disabled | Proje edit endpoint/UI yok |
| Summary’den aktif sayı | Mevcut `dashboard/summary` |
| Debounced search | Dashboard ile aynı 350ms kalıp |

---

## 3. Responsive

- Desktop: 8 kolonlu satır grid.
- Tablet/Mobile: isim+kod + badge stack; aksiyonlar görünür; diğer kolonlar gizlenir.

---

## 4. Component yapısı

```
AdminProjectsView / ProjectsPage (PM)
├── ProjectPortfolioHeader
├── ProjectPortfolioFilterBar
├── ProjectPortfolioList
│   └── ProjectPortfolioRow (memo)
└── ProjectPortfolioSkeleton
```

Paylaşılan: `EnterpriseBadge` (export), `UserAvatar`, `mapPortfolioRows`, `dashboardTokens`.

---

## 5. Accessibility

- Satır `role="row"`, keyboard Enter/Space.
- Focus-visible outline.
- Action icon `aria-label` + tooltip.
- Filter clear / refresh labels.
- `aria-live` last updated.

---

## 6. Performans

- Yeni endpoint yok.
- `ProjectPortfolioRow` `memo`.
- `mapPortfolioRows` + summary `useMemo`/`useQuery` cache.
- Search debounce.

---

## 7. Tasarım prensipleri

1. Scan-first hierarchy (name → badges → progress).  
2. Border + soft hover, minimal shadow.  
3. Semantic color only via badges/progress.  
4. Dense but breathable (8pt spacing).  
5. Demo-ready: CTO günlük kullanım.

---

## 8. Backend doğrulama

- `GET /dashboard/projects`, `GET /dashboard/summary`, `GET /users` (manager filter).
- Controller / entity / Flyway dokunulmadı.
