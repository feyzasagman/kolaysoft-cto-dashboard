# Day 15 — Project Detail Enterprise Redesign (Sprint 2)

**Kapsam:** Yalnızca Project Detail ekranı (frontend).  
**Kısıt:** Backend / API / Entity / DB / business logic değişmedi.

> Not: Dosya adı talep üzerine `Day15_…` olarak tutulmuştur. Dashboard Sprint 1 dokümanı `Day16_Dashboard_Enterprise_Redesign.md` ile yan yana okunabilir.

---

## 1. Yapılan değişiklikler

- **Hero Header:** Proje adı, kod, status/health badge, manager avatar, last updated, started, current week, progress bar; sağda Edit / Refresh / More.
- **6 Summary Cards:** Overall Progress, Open Risks, Completed Tasks, Weekly Reports, Team Members, Project Health — eşit yükseklik, hover, minimal shadow.
- **Layout:** Header → Metrics → (Tabs + içerik | Quick Info sidebar). Sidebar lg’de sticky; mobile’da alta iner.
- **Tabs:** Overview · Reports · Risks · Work Items · History — Fade geçiş, belirgin aktif sekme.
- **Overview:** Summary + Progress hero + Recent report cards + Risks + Work checklist + Activity timeline.
- **Reports:** Premium kart listesi (week, health, progress, summary, updated, status, actions).
- **Risks:** Critical/High/Medium/Low özet + profesyonel risk satırları.
- **Work Items:** Checklist (status icon, assignee avatar, progress).
- **Activity Timeline:** Mevcut DTO’lardan türetilmiş GitHub-benzeri olay akışı.
- **Skeleton / Error / Empty:** Layout-matched loading; network/404/permission UI.

---

## 2. UX kararları

| Karar | Gerekçe |
|--------|---------|
| `createdAt` yok → “Started” = `startDate` | Detail DTO’da createdAt yok; uydurma veri yok |
| Team Members = 1 (manager) | Takım listesi endpoint’i yok |
| Timeline türetilmiş | Yeni activity API yok; rapor/risk/work item’dan sentez |
| Edit → son rapor edit | Proje edit route yok; gerçek aksiyon |
| Overview içinde tüm bölümler | “Yönetmek kolay” — tek bakışta bağlam; sekmeler derinleşme için |

---

## 3. Responsive

- Metrics: 1 / 2 / 3 kolon.
- Main + sidebar: tek kolon (mobile), iki kolon (lg+); sidebar order alta.
- Tabs scrollable.
- Report/risk kartları dikey stack.

---

## 4. Accessibility

- Tab `aria-controls` / tabpanel `role` / `aria-labelledby`.
- Progress bar label’ları.
- Action menü `aria-haspopup`.
- Timeline `ol` / `li` semantiği.
- Empty/error `role="alert"` (AppErrorState).
- Tooltip’li Edit / More.

---

## 5. Performance

- Yeni network çağrısı eklenmedi (mevcut detail/reports/work/risk/latest).
- `useMemo` — model, workStats, timeline.
- `memo` — TabPanel.
- Gereksiz lazy chunk yok (tek sayfa, zaten route seviyesinde).

---

## 6. Component yapısı

```
ProjectDetailPage
├── ProjectHeroHeader
├── ProjectMetricCards
├── Tabs
│   ├── ProjectOverviewPanel + ProjectProgressHero
│   ├── ProjectReportCards
│   ├── ProjectRisksPanel
│   ├── ProjectWorkItemsChecklist
│   └── ProjectActivityTimeline
└── ProjectQuickSidebar
```

Paylaşılan: `StatusBadges`, `UserAvatar`, `EmptyState`, `AppErrorState`, `dashboardTokens`, `projectDetailMapper`.

---

## 7. Backend doğrulama

- Endpoint değişmedi: `GET /dashboard/projects/{id}`, reports, work-items, risk-issues, weekly-report.
- Entity / Flyway / controller dokunulmadı.
