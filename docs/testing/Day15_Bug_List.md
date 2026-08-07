# Day 15 — Açık Hata Listesi

| Doküman | Değer |
|---|---|
| Tarih | 7 Ağustos 2026 |
| Ortam | Development |
| Kapsam | MVP test turu — düzeltme yok (16–17. gün) |

---

## BUG-001

**Başlık:** Haftalık rapor çakışma mesajı yönetmelik metninden farklı

**Alan:** Backend  

**Önem:** Low  

**Ortam:** Development  

**Ön koşul:** Aynı proje + yıl + hafta için rapor mevcut  

**Adımlar:**
1. PROJECT_MANAGER ile login
2. Aynı `projectId` + `weekNumber` ile ikinci `POST /api/v1/reports`

**Beklenen:**  
HTTP 409  
Mesaj: `Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.`

**Gerçekleşen:**  
HTTP 409  
Mesaj: `Bu proje ve hafta için rapor zaten mevcut.`

**Kanıt:** Day15 API matrisi REPORT-02; `WeeklyReportServiceImpl` ConflictException  

**Durum:** OPEN  

**Önerilen düzeltme:** Mesajı sözleşmeye hizala veya API dokümanını mevcut metne güncelle.

---

## BUG-002

**Başlık:** YELLOW/RED (veya gecikmeli) sağlık durumunda risksiz rapor oluşturma engeli yok

**Alan:** Backend  

**Önem:** Medium  

**Ortam:** Development  

**Ön koşul:** PM atanmış proje  

**Adımlar:**
1. `POST /api/v1/reports` ile `scheduleStatus=DELAYED` (veya sağlık hesabını kırmızı/sarı yapacak ilerleme)
2. Açık risk eklemeden kaydet

**Beklenen:** Analiz dokümanındaki iş kuralı geçerliyse reddedilmeli (400/422)  

**Gerçekleşen:** HTTP 201 — rapor risksiz oluşturuluyor; health ayrıca hesaplanıyor  

**Kanıt:** RISK-07; `WeeklyReportServiceImpl` içinde risk zorunluluğu kontrolü yok  

**Durum:** OPEN  

**Önerilen düzeltme:** İş kuralını netleştir; gerekiyorsa create/update’te doğrula. Bugün implement edilmedi.

---

## BUG-003

**Başlık:** Boş path ile work-item/risk PUT isteği 500 dönüyor

**Alan:** Backend  

**Önem:** Medium  

**Ortam:** Development  

**Ön koşul:** Geçerli JWT  

**Adımlar:**
1. `PUT /api/v1/work-items/` (id yok)
2. veya `PUT /api/v1/risks/`

**Beklenen:** 404 veya 405 (anlamlı istemci hatası), asla 500 değil  

**Gerçekleşen:**  
HTTP 500  
`INTERNAL_ERROR` / “Beklenmeyen bir hata oluştu.”  
path: `/api/v1/work-items/` veya `/api/v1/risks/`

**Kanıt:** Day15 ek probe (EMPTY path)  

**Durum:** OPEN  

**Önerilen düzeltme:** Path değişkeni bağlama/NumberFormat hatalarını GlobalExceptionHandler’da 400/404’e map et.

---

## Bu turda BUG olmayan FAIL’ler (düzeltildi / yeniden sınıflandı)

| Senaryo | İlk sonuç | Yeniden doğrulama |
|---|---|---|
| ROLE-02 CTO users GET | FAIL (200) | **PASS** — `UserController` bilinçli `ADMIN,CTO` okuma; create/update/delete 403 |
| WORK-05 / RISK-06 | FAIL (500) | **PASS** — geçerli ID ile 403; ilk 500 boş/yanlış id’den (BUG-003 ile ilişkili) |
| REPORT-08 edit | FAIL (400) | **PASS** — `weekNumber` zorunlu; eksik body test hatasıydı |

---

**Özet:** Bu test turunda **3 OPEN** uygulama hatası kaydedildi (1 Low, 2 Medium). Critical açık bug yok.
