# Day 15 — Project Detail Command Center (Sprint 4)

**Kapsam:** Project Detail ekranı (frontend-only).  
**Kısıt:** Backend / API / Entity / DB / business logic / sahte activity yok.

Bu hâlâ 15. gün iyileştirme sprintidir (Day16 diye adlandırılmadı).

---

## 1. Sprint amacı

Project Detail’i uzun kaydırma sayfasından **Project Command Center**’a dönüştürmek.  
Kullanıcı 5 saniyede şunları görmeli: sağlık, hedef farkı, risk, son rapor, açık işler.

---

## 2. Önceki sorunlar

- Bilgi yoğunluğu dağınık; “staj template” hissi.
- Sahte/türetilmiş activity timeline audit gibi sunuluyordu.
- Tab state URL’de yoktu (refresh kaybediyordu).
- Metric’lerde backend’de olmayan alanlar (ör. team members) vardı.
- Hero aşırı yüksek / aksiyonlar route’suz butonlar içeriyordu.

---

## 3. Yeni bilgi mimarisi

1. Breadcrumb  
2. Compact Hero  
3. 6 Summary Metrics  
4. Sticky Tabs (URL `?tab=`)  
5. Overview (8/4 grid)  
6. Latest Weekly Report  
7. Risks & Blockers  
8. Work Items  
9. Report History  
10. Project Information Rail  

---

## 4. Hero header

`ProjectHeroHeader`: ad, kod, customer (DTO yoksa gizlenir), badge’ler, manager, dates, ince progress.  
Aksiyonlar role + route’a göre: Yenile; PM/ADMIN rapor CTA; proje edit route yok → Düzenle yok.

---

## 5. Metrics

Gerçekleşen / Hedef / Açık Risk / Kritik Risk (son rapor risk listesinden) / Açık İş Kalemi / Haftalık Rapor Sayısı.  
Uydurma alan yok.

---

## 6. Tabs

Genel Bakış · Raporlar · Riskler · İş Kalemleri · Geçmiş  
`?tab=` ile korunur; `from=dashboard` korunur.

---

## 7. Progress

`ProjectProgressPanel`: actual, target, fark (puan + “Hedefin gerisinde / Hedefle uyumlu”), ince bar, health, schedule.

---

## 8. Latest report

`LatestWeeklyReportCard`: week/year/date/status/health/progress + completed/planned/note (truncate + Devamını Gör).  
Rapor yoksa dürüst empty + rol uygunsa CTA.

---

## 9. Risk panel

Mini özet (Open / Critical / Resolved), CRITICAL/HIGH sol border öncelik, badge’ler.  
Risk DTO’da createdAt yok → tarih uydurulmadı.

---

## 10. Work items

Liste: status icon, title, assignee, dates, note preview, related report.  
Priority yok → gösterilmedi.

---

## 11. Report history

`ProjectReportTimeline`: commit-tarzı timeline, en yeni üstte, View → report detail.

---

## 12. History sınırı / audit

Audit log yok. Geçmiş sekmesinde dürüst empty state + proje tarihleri + gerçek rapor timeline.  
Sahte “Status changed / Manager assigned” event stream kaldırıldı.

---

## 13. Rol bazlı UX

| Rol | Görünüm |
|-----|---------|
| CTO | Read-only, Yenile + Raporu Gör |
| ADMIN | Yenile, rapor oluştur (mevcut yetki), proje edit yok |
| PM (atanmış) | Rapor oluştur/gör + yenile |
| PM (atanmamış) | Backend 403 → unauthorized |

---

## 14. Responsive

Desktop 8/4; tablet rail alta; mobile tek kolon; tabs scroll; sticky tabs md+.

---

## 15. Accessibility

Breadcrumb nav, tab aria, progress valuemin/max/now, icon labels, empty/error metinleri.

---

## 16. Performans

Query parent’ta; `useMemo` model/riskCounts/openWorkItems; ekstra endpoint yok.

---

## 17. Reusable componentler

`ProjectHeroHeader`, `ProjectMetricGrid/Card`, `ProjectDetailTabs`, `ProjectOverviewTab`, `ProjectProgressPanel`, `LatestWeeklyReportCard`, `ProjectRiskPanel`, `ProjectWorkItemsPanel`, `ProjectReportTimeline`, `ProjectInfoRail`, skeleton/error.

---

## 18. Build / lint

- `npm run build` — başarılı (tsc + vite)
- `npm run lint` — 0 error; mevcut react-refresh uyarıları (AuthContext / ProjectDetailTabs)

---

## 19. Açık kalan noktalar

- Customer DTO’da yok  
- Proje edit route yok  
- Risk created/updated timestamp yok  
- Audit/activity API yok  
- Work item priority yok  
