# Day 15 — MVP Test Turu Raporu

| Bilgi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Tarih | 7 Ağustos 2026 |
| Sürüm / Build | `cto-dashboard-api` 0.0.1-SNAPSHOT · frontend 0.1.0 |
| Ortam | Development (Docker Postgres + local BE/FE) |
| Kural | Yeni özellik yok; hatalar kayda alındı, düzeltilmedi |

---

## 1. Amaç

Kritik MVP akışlarını pozitif/negatif/validasyon/rol senaryolarıyla doğrulamak; backend–frontend–entegrasyon hatalarını ayırmak; 16–17. gün düzeltme listesini hazırlamak.

---

## 2. Yönetmelik 15. gün hedefi

- Kritik akış testi
- Rapor / iş kalemi / dashboard E2E
- Hata listesi
- Kalan riskler
- Bugün feature geliştirme yok

---

## 3. Test ortamı

| Bileşen | Durum |
|---|---|
| Java | 21.0.12 Temurin |
| PostgreSQL | Docker `cto-dashboard-postgres` · DB `cto_dashboard` |
| Flyway | version 1 BASELINE · `Schema is up to date` |
| Hibernate | `ddl-auto=validate` · startup OK |
| Backend | `http://localhost:8080` |
| Frontend | `http://localhost:5173` |
| Swagger | `http://localhost:8080/swagger-ui/index.html` |

Sağlık: `GET /api/v1/health` → **200**

---

## 4. Test edilen build/version

- Backend: Spring Boot 3.5.16
- Frontend: React 18 + Vite 6
- Migration: `V1__init_schema.sql` (baseline’lı mevcut DB)

---

## 5. Test verisi

Gerçek şirket verisi kullanılmadı. Day15 için oluşturulan / kullanılan:

| Tür | Değer |
|---|---|
| ADMIN | `admin@kolaysoft.com.tr` (seed) |
| CTO | `day15.cto@kolaysoft.com.tr` |
| PM1 | `day15.pm1@kolaysoft.com.tr` → proje `D15-P1-*` (id=3) |
| PM2 | `day15.pm2@kolaysoft.com.tr` → proje `D15-P2-*` (id=4) |
| Raporlar | PM1 hafta 40/45; PM2 hafta 40 (auth probe) |
| Work item / Risk | Day15 WI, High/Critical riskler |

Veriler silinmedi (talimat).

Ham sonuç CSV: `docs/testing/Day15_results.csv` (ilk koşu; bazı FAIL’ler aşağıda yeniden sınıflandı).

---

## 6. Backend test sonuçları

| Komut | Sonuç |
|---|---|
| `./mvnw test` | **BUILD SUCCESS** |
| Tests run | **54** |
| Failures | **0** |
| Errors | **0** |
| Skipped | **0** |
| `./mvnw clean package` | **BUILD SUCCESS** |

---

## 7. Frontend test sonuçları

| Komut | Sonuç |
|---|---|
| `npm run build` | **PASS** |
| `npm run lint` | **PASS** (0 error) |
| FE unit test | Yok (vitest/RTL yok) |

### Bilinen uyarılar (yeni hata değil)

1. `AuthContext.tsx` — react-refresh/only-export-components  
2. `Sidebar.tsx` — react-refresh/only-export-components  

---

## 8. Authentication testleri

| ID | Sonuç | Not |
|---|---|---|
| AUTH-01 ADMIN | PASS | JWT |
| AUTH-02 CTO | PASS | |
| AUTH-03 PM | PASS | |
| AUTH-04 yanlış parola | PASS | 401 |
| AUTH-05 olmayan email | PASS | aynı güvenli mesaj |
| AUTH-06 boş alan | PASS | 400 |
| AUTH-07 tokensız | PASS | 401 |
| AUTH-08 geçersiz JWT | PASS | 401 (500 değil) |
| AUTH-09 expired JWT | NOT_TESTED | fixture yok |

---

## 9. Rol testleri

| ID | Sonuç | Not |
|---|---|---|
| ROLE-01 ADMIN users | PASS | |
| ROLE-02 CTO mutate users | PASS | create/update **403**; GET list CTO’ya açık (kod sözleşmesi) |
| ROLE-03 PM users | PASS | 403 |
| ROLE-04 CTO dashboard | PASS | |
| ROLE-05 PM dashboard | PASS | 403 |
| ROLE-06 PM kendi proje | PASS | |
| ROLE-07 PM yabancı proje | PASS | 403 |
| ROLE-08 CTO rapor okuma | PASS | edit UI salt okunur (FE) |

---

## 10. Project testleri

PRJ-01…08 → **PASS** (create, 409 duplicate code, non-PM manager reddi, validation 400, pagination/search/status, 404).

---

## 11. Weekly Report testleri

| ID | Sonuç | Bug |
|---|---|---|
| REPORT-01 create + detail | PASS | |
| REPORT-02 duplicate week | FAIL* | BUG-001 (409 OK, mesaj farklı) |
| REPORT-03 week=0 | PASS | |
| REPORT-04 week=54 | PASS | |
| REPORT-05 progress=-1 | PASS | |
| REPORT-06 progress=101 | PASS | |
| REPORT-07 yabancı proje | PASS | 403 |
| REPORT-08 edit | PASS | weekNumber zorunlu |

\*HTTP davranışı doğru; sözleşme metni sapması.

---

## 12. Work Item testleri

WORK-01…06 → **PASS** (geçerli ID ile WORK-05 = 403).  
Ek: boş path PUT → **BUG-003**.

---

## 13. Risk testleri

| ID | Sonuç | Bug |
|---|---|---|
| RISK-01 HIGH | PASS | |
| RISK-02 CRITICAL | PASS | |
| RISK-03 empty title | PASS | |
| RISK-04 bad level | PASS | |
| RISK-05 update | PASS | |
| RISK-06 yabancı PM | PASS | 403 |
| RISK-07 risksiz YELLOW/RED kuralı | FAIL | BUG-002 |

---

## 14. Dashboard testleri

DASH-01…15 → **PASS** (summary, health-dist, portfolio, filtreler, pagination, sort, detail, latest report, risk/WI alanları, URL state kod doğrulaması).

---

## 15. UI state testleri

UI-01…11 → **PASS** (kod + mevcut bileşen doğrulaması).  
UI-12 double-submit, UI-13 field mapping → **NOT_TESTED** (manuel tarayıcı).

---

## 16. Responsive testleri

| Çözünürlük | Sonuç |
|---|---|
| 1440×900 | NOT_TESTED |
| 1366×768 | NOT_TESTED |
| 768×1024 | NOT_TESTED |
| 390×844 | NOT_TESTED |

Gerekçe: otomatik browser matrix yok; layout kodu responsive grid içeriyor — görsel PASS/FAIL 16. güne manuel checklist.

---

## 17. Failure / connection testleri

ERR-01…04 → **NOT_TESTED** (suite’i bozmamak için Postgres/backend kill edilmedi).  
Risk listesine alındı; önceki günlerde graceful error pattern’i mevcut.

---

## 18. Flyway / database testleri

| ID | Sonuç |
|---|---|
| DB-01 normal startup | PASS |
| DB-02 up to date | PASS |
| DB-03 validate | PASS |
| DB-04 history BASELINE v1 | PASS |
| DB-05 veri korunumu | PASS |
| DB-06 remigrate yok | PASS |

---

## 19. Smoke test

| Adım | Sonuç |
|---|---|
| Login | PASS |
| Project list | PASS |
| Weekly report create | PASS |
| Work item create | PASS |
| Risk create | PASS |
| CTO login | PASS |
| Dashboard | PASS |
| Project detail | PASS |
| Report view | PASS |
| Logout (FE) | PASS (kod yolu) |

**Smoke: PASS**

---

## 20. Test matrisi (özet)

Detay CSV: `Day15_results.csv`  
Yeniden sınıflama sonrası ana sonuçlar:

| Sonuç | Adet (yaklaşık) |
|---|---|
| PASS | 90 |
| FAIL | 3 |
| BLOCKED | 0 |
| NOT_TESTED | 11 |
| Toplam kayıt | ~104 |

FAIL senaryolar: REPORT-02 (BUG-001), RISK-07 (BUG-002), boş path PUT (BUG-003).

---

## 21. Özet metrikler

| Metrik | Değer |
|---|---|
| Test edilebilen (PASS+FAIL) | 93 |
| PASS | 90 |
| FAIL | 3 |
| Başarı oranı | **96.8%** |
| Critical bug | **0** |
| High bug | **0** |
| Medium bug | **2** (BUG-002, BUG-003) |
| Low bug | **1** (BUG-001) |

---

## 22. Bulunan hatalar

Ayrıntı: [`Day15_Bug_List.md`](./Day15_Bug_List.md)

1. BUG-001 — conflict mesaj metni  
2. BUG-002 — risksiz kırmızı/sarı rapor kuralı yok  
3. BUG-003 — boş id path → 500  

---

## 23. Kalan riskler

1. Production deployment yapılmadı  
2. Responsive / çoklu tarayıcı manuel doğrulanmadı  
3. Performans / load testi yok  
4. Refresh token yok  
5. Flyway production baseline prosedürü manuel  
6. E2E otomasyon (Playwright/Cypress) yok  
7. ERR-* connection kill senaryoları bu turda koşulmadı  
8. Expired JWT fixture yok  

---

## 24. 16–17. gün düzeltme planı

Öncelik:

1. **BUG-003** — 500 → 404/400 map (güvenlik/kalite)  
2. **BUG-002** — iş kuralı kararı + gerekirse backend doğrulama  
3. **BUG-001** — mesaj hizalama  
4. Manuel responsive checklist (1440 / 1366 / 768 / 390)  
5. ERR-01/02 backend down + retry smoke  
6. UI-12/13 double-submit ve field error mapping manuel  

Feature ekleme yok; yalnızca bugfix + doğrulama.
