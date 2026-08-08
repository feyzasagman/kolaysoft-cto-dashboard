# Day 15 — Weekly Report Enterprise Experience

**Kapsam:** Haftalık rapor liste / oluştur / düzenle / detay (frontend-only).  
**Kısıt:** Backend / API / Entity / DB / business logic / sahte DTO alanı yok.

Bu hâlâ 15. gün iyileştirme sprintidir (Day16 diye adlandırılmadı).

---

## 1. Sprint amacı

PM’nin her hafta doldurduğu rapor akışını hızlı, net ve yorucu olmayan bir enterprise deneyime taşımak; CTO’nun raporu yönetim dokümanı gibi okuyabilmesini sağlamak.

---

## 2. Önceki sorunlar

- Liste klasik DataGrid CRUD görünümündeydi.
- Form tek uzun bloktu; progress karşılaştırması zayıftı.
- Detail İngilizce kart yığını + admin tabloları.
- Skeleton / filtre / 409 recovery eksikti.
- Design token (`DASH` / badge) tutarsız kullanımı.

---

## 3. Yeni report list yaklaşımı

GitHub/Linear yoğunluğunda satır listesi:

- Proje adı + kod, yıl/hafta, tarih, gerçekleşen/hedef %, status, schedule
- Health / açık risk / manager / updatedAt **DTO’da yok → gösterilmedi**
- Filtre: search, project, year, week, schedule (sayfa içi), sort
- URL query ile filtre korunur

---

## 4. Create/Edit form bilgi mimarisi

Bölümler: Proje & Dönem · İlerleme & Durum · Yapılanlar · Gelecek Plan · Genel Not  
Ortak `WeeklyReportForm`; sticky/header Kaydet + mobil alt action bar.

---

## 5. Progress deneyimi

Canlı UI karşılaştırması (form watch): Hedef / Gerçekleşen / Fark + “Hedefin X puan gerisinde” / “Hedefle uyumlu”. Backend logic değil.

---

## 6. Validation UX

Zod + RHF; Türkçe kısa mesajlar; backend field errors `setError`; 409 üstte inline alert + “Mevcut raporları gör” (liste filtresi).

---

## 7. Submit UX

Disabled + spinner + “Kaydediliyor…”; toast “Haftalık rapor başarıyla kaydedildi.”; detail’e yönlendirme; hata durumunda form korunur.  
`beforeunload` dirty guard mevcut; router blocker eklenmedi (karmaşık hack yok).

---

## 8. Report detail document yaklaşımı

`WeeklyReportHero` + readable `max-width` document:

Özet · İlerleme · Bu Hafta · Gelecek Hafta · Genel Not · Riskler · İş Kalemleri

Health badge yok (WeeklyReport DTO’da health yok). Status/schedule badge kullanıldı.

---

## 9. Risk deneyimi

Premium liste; CRITICAL/HIGH sol border; empty: “Açık risk veya engel bulunmuyor.”  
PM/ADMIN CRUD korundu; CTO read-only.

---

## 10. Work item deneyimi

Status icon + title + assignee avatar + tarihler + note preview. CRUD yetkisi aynı.

---

## 11. Role-based UX

| Rol | Davranış |
|-----|----------|
| PM / ADMIN | create/edit + nested CRUD |
| CTO | list/detail okuma; edit CTA yok |

---

## 12. Empty / loading / error

List skeleton; empty copy; filter empty; network error + Tekrar Dene. Detail skeleton.

---

## 13. Responsive

Form 2→1 kolon; sticky mobile actions; list mobile kompakt; detail readable width.

---

## 14. Accessibility

Breadcrumb, labels, aria-describedby/invalid, progress valuemin/max/now, alert role, focus-visible, icon aria-label.

---

## 15. Performance

Liste/query parent seviyesinde; form’da yalnızca progress alanları watch; ekstra endpoint yok.

---

## 16. Regression sonuçları

Kod düzeyinde korunan: 403→unauthorized, 409 mesajı, PM create, CTO read-only, detail work/risk CRUD, project→new report linkleri. Manuel smoke önerilir.

---

## 17. Açık kalan noktalar

- WeeklyReport DTO: health, manager, openRisk, updatedAt yok
- Schedule filtre API’de yok → mevcut sayfa içeriğinde client filter
- Router-level unsaved changes blocker yok (yalnızca beforeunload)
- Rapor silme UI yok (API var, kullanılmıyor)
