# Day 16 — Bug Fix and Retest Report

| Bilgi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Tarih | 10 Ağustos 2026 |
| Kapsam | Day 15 MVP bug fix / stabilization |
| Kural | Yeni feature / redesign yok |

---

## 1. Amaç

Day 15 test turunda bulunan **BUG-001**, **BUG-002**, **BUG-003** hatalarını kök neden düzeyinde düzeltmek; regression testlerle doğrulamak; uygulamayı Day 17 öncesi stabilize etmek.

Kaynak dokümanlar (geçmiş sonuçlar korunmuştur):

- `docs/testing/Day15_MVP_Test_Report.md`
- `docs/testing/Day15_Bug_List.md`
- `docs/testing/Day15_results.csv`

---

## 2. Day 15'ten Devralınan Hatalar

| Bug | Severity | Alan | Özet |
|---|---|---|---|
| BUG-003 | Medium | Backend | `PUT /work-items/` veya `PUT /risks/` (id yok) → HTTP 500 |
| BUG-002 | Medium | Backend | YELLOW/RED (DELAYED vb.) sağlıkta risksiz rapor create mümkün |
| BUG-001 | Low | Backend | Duplicate week 409 mesajı sözleşmeden sapık |

---

## 3. BUG-003 Root Cause / Fix

### Root cause

Boş path ile `PUT /api/v1/work-items/` (veya `/risks/`) için eşleşen handler yok. Spring Boot 3.5 `NoResourceFoundException` (veya method-not-supported) fırlatıyor; `GlobalExceptionHandler` yalnızca generic `Exception` yakalıyordu → **HTTP 500 / INTERNAL_ERROR**.

Katman: Exception mapping (GlobalExceptionHandler). API contract / entity değişmedi.

### Fix

`GlobalExceptionHandler` içine eklendi:

- `NoResourceFoundException` → **404** `NOT_FOUND`
- `HttpRequestMethodNotSupportedException` → **405** `METHOD_NOT_ALLOWED`
- `MissingPathVariableException` → **400** `MISSING_PATH_VARIABLE`

Retest (otomasyon): `PUT /api/v1/work-items/` → **404**, `success=false`, code ≠ `INTERNAL_ERROR`.

---

## 4. BUG-002 Root Cause / Fix

### Root cause

`ReportHealthCalculator` schedule/progress/risklerden YELLOW/RED üretebiliyordu; ancak `WeeklyReportServiceImpl` create/update’te “sarı/kırmızı sağlık ⇒ açık risk zorunlu” kuralını uygulamıyordu. Riskler ayrı endpoint ile rapor sonrası eklendiği için create anında risksiz DELAYED kaydı mümkün kalıyordu.

Katman: Domain / service business rule. Schema değişmedi.

### Fix

1. `ReportHealthCalculator.isUnhealthyWithoutOpenRisks(...)` eklendi.
2. `WeeklyReportServiceImpl` create + update öncesi doğrulama:
   - Health YELLOW/RED ve açık risk yoksa → `BusinessRuleException` (**400** / `BUSINESS_RULE`)
   - Mesaj: `Sarı veya kırmızı sağlık durumundaki haftalık raporlarda en az bir açık risk tanımlanmalıdır.`

Regression senaryoları (unit):

- risksiz DELAYED create → reddedilmeli
- risksiz ON_TRACK create → kabul
- DELAYED update + açık HIGH risk → kabul
- CRITICAL açık risk ile RED → kural ihlali değil

---

## 5. BUG-001 Root Cause / Fix

### Root cause

`ensureUniqueWeek` `ConflictException("Bu proje ve hafta için rapor zaten mevcut.")` fırlatıyordu. Day 15 sözleşmesi / FE beklentisi:

`Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.`

HTTP 409 davranışı doğruydu; yalnızca mesaj sapması vardı.

### Fix

Conflict mesajı sözleşmeye hizalandı. Controller testi güncellendi. Frontend zaten 409’da benzer metni normalize ediyordu; backend source of truth düzeltildi.

---

## 6. Değiştirilen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `.../exception/GlobalExceptionHandler.java` | 404/405/missing-path map (BUG-003) |
| `.../util/ReportHealthCalculator.java` | unhealthy-without-open-risk helper (BUG-002) |
| `.../service/impl/WeeklyReportServiceImpl.java` | risk kuralı + conflict mesajı (BUG-002/001) |
| `.../controller/WorkItemControllerTest.java` | boş path PUT regression |
| `.../controller/RiskIssueControllerTest.java` | boş path PUT regression |
| `.../controller/WeeklyReportControllerTest.java` | 409 mesaj + business rule |
| `.../util/ReportHealthCalculatorTest.java` | kural unit testleri |
| `.../service/impl/WeeklyReportServiceImplTest.java` | **yeni** service unit testleri |
| `docs/testing/Day15_Bug_List.md` | status → RESOLVED/RETESTED (geçmiş korundu) |
| `docs/testing/Day16_Bug_Fix_and_Retest_Report.md` | bu rapor |
| `README.md` | Day 16 linki |

Frontend kaynak kodu bu sprintte değiştirilmedi.

---

## 7. Regression Tests

| Test | Kapsar |
|---|---|
| `WorkItemControllerTest.shouldNotReturn500WhenPutWithoutId` | BUG-003 |
| `RiskIssueControllerTest.shouldNotReturn500WhenPutWithoutId` | BUG-003 |
| `WeeklyReportServiceImplTest.shouldRejectDuplicateWeekWithContractMessage` | BUG-001 |
| `WeeklyReportServiceImplTest.shouldRejectDelayedCreateWithoutOpenRisk` | BUG-002 |
| `WeeklyReportServiceImplTest.shouldAllowHealthyCreateWithoutRisks` | BUG-002 regresyon |
| `WeeklyReportServiceImplTest.shouldAllowUpdateToDelayedWhenOpenRiskExists` | BUG-002 regresyon |
| `ReportHealthCalculatorTest` (yeni 3 senaryo) | BUG-002 domain |

---

## 8. Build/Test Sonuçları

| Komut | Sonuç |
|---|---|
| `./mvnw test` | **BUILD SUCCESS** — Tests run: **64**, Failures: 0, Errors: 0 |
| `./mvnw clean package` | **BUILD SUCCESS** |
| `npm run build` | **PASS** (frontend değişmedi, doğrulama) |
| `npm run lint` | **PASS** (0 error) |

---

## 9. Retest Sonuçları

| BUG ID | Previous | Fix | Retest | Expected | Actual | HTTP | Final |
|---|---|---|---|---|---|---|---|
| BUG-003 | FAIL (500) | Exception map 404/405 | Otomatik MockMvc | 404/405/400, asla 500 | 404 `NOT_FOUND` | 404 | **PASS** |
| BUG-002 | FAIL (201) | Business rule create/update | Unit + controller | 400 BUSINESS_RULE | 400 + mesaj | 400 | **PASS** |
| BUG-001 | FAIL (mesaj) | Conflict mesaj hizalama | Unit + controller | Sözleşme mesajı + 409 | Aynı mesaj | 409 | **PASS** |

İlişkili kısa regression (mevcut suite): auth, role, project, report, work-item, risk, dashboard controller testleri yeşil.

---

## 10. Kalan Açık Hatalar

**Day 15 MVP buglarından açık kalan: 0.**

Not (Day 17 adayı, yeni bug değil):

- Risk silme / RESOLVED sonrası rapor DELAYED kalırsa unhealthy-without-risk durumu RiskIssue akışında henüz yeniden doğrulanmıyor (yalnızca report create/update).
- Day 15 NOT_TESTED maddeleri (responsive manuel, ERR-* kill, expired JWT) bu turda koşulmadı.

---

## 11. Teknik Riskler

1. BUG-002 create akışı: DELAYED rapor için önce ON_TRACK create → risk ekle → DELAYED update gerekir (API tasarımı gereği).
2. Progress gap ≥10/20 risksiz create’i de reddeder (health YELLOW/RED); beklenen iş kuralı.
3. Production’da canlı E2E smoke henüz koşulmadı (otomasyon + unit ile doğrulandı).

---

## 12. Day 17 İçin Hazırlık

1. Risk delete/resolve sonrası unhealthy rapor guard (isteğe bağlı)
2. Manuel responsive checklist (1440 / 1366 / 768 / 390)
3. ERR-01/02 backend down + retry smoke
4. UI-12/13 double-submit / field mapping manuel
5. Production deploy / smoke (ortam hazırsa)
