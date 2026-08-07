# Day 15 — MVP Test Turu Özeti

| Bilgi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Tarih | 7 Ağustos 2026 |
| Tür | Staj günlük analiz özeti |
| Kapsam | Test / hata kaydı — yeni özellik yok |

---

## 1. Günün amacı

MVP kritik akışlarını (auth, rol, proje, haftalık rapor, iş kalemi, risk, dashboard) pozitif/negatif/validasyon senaryolarıyla doğrulamak; bulunan hataları kaydetmek; düzeltmeleri 16–17. güne bırakmak.

---

## 2. Test ortamı

- Java 21 · Spring Boot 3.5 · PostgreSQL (Docker `cto-dashboard-postgres`)
- Flyway v1 baseline · Hibernate `ddl-auto=validate`
- Backend `http://localhost:8080` · Frontend `http://localhost:5173`
- Demo/Day15 kullanıcıları: ADMIN, CTO, 2× PROJECT_MANAGER

---

## 3–5. Özet metrikler

| Metrik | Değer |
|---|---|
| Toplam senaryo kaydı | ~104 |
| PASS | 90 |
| FAIL | 3 |
| BLOCKED | 0 |
| NOT_TESTED | 11 |
| Test edilebilir (PASS+FAIL) | 93 |
| Başarı oranı | **96.8%** |

Otomatik: `./mvnw test` → 54/54 PASS · `npm run build` / `lint` → PASS (2 bilinen warning).

---

## 6. Bug severity özeti

| Seviye | Adet | ID |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 2 | BUG-002, BUG-003 |
| Low | 1 | BUG-001 |
| **OPEN toplam** | **3** | |

---

## 7. Ana bulgular

- Auth, rol, proje, rapor/WI/risk mutasyonları ve dashboard filtreleri büyük ölçüde sağlam.
- Smoke E2E (login → rapor → WI → risk → CTO dashboard) **PASS**.
- Flyway + mevcut `cto_dashboard` verisi korunarak çalışıyor.
- Açık sorunlar: çakışma mesajı metni (BUG-001), risksiz YELLOW/RED iş kuralı yok (BUG-002), boş path PUT → 500 (BUG-003).
- Responsive ve connection-kill senaryoları bu turda otomatize edilmedi (NOT_TESTED).

---

## 8. Kalan riskler

- Production deploy yok
- Refresh token yok
- Tarayıcı/responsive manuel checklist eksik
- Performans/load testi yok
- E2E otomasyon (Playwright vb.) yok
- Flyway prod baseline prosedürü manuel

---

## 9. 16. gün öncelikleri

1. BUG-003 — boş id path 500 → 404/400  
2. BUG-002 — risksiz sağlık kuralı kararı + gerekirse doğrulama  
3. BUG-001 — conflict mesaj hizalama  
4. Responsive + ERR (backend down / retry) manuel doğrulama  

---

## 10. Detaylı test dokümanları

| Doküman | İçerik |
|---|---|
| [Day15_MVP_Test_Report.md](../testing/Day15_MVP_Test_Report.md) | Tam test raporu, senaryo bölümleri, smoke, riskler |
| [Day15_Bug_List.md](../testing/Day15_Bug_List.md) | BUG-001…003 kayıtları (OPEN) |
| [Day15_results.csv](../testing/Day15_results.csv) | İlk koşu ham sonuç matrisi |

Önerilen commit: `test: complete Day 15 MVP test cycle`
