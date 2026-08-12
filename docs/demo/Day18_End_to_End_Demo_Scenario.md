# Day 18 — Uçtan Uca Demo Senaryosu

Kolaysoft CTO Dashboard Full Stack MVP  
Day 20 sunumuna da temel olacak doğrulanabilir akış.

**Ortam:** Docker Compose (`http://localhost:3000`) veya manuel Vite (`http://localhost:5173`) + backend `:8080`  
**Seed ADMIN (DEMO ONLY):** `admin@kolaysoft.com.tr` / `Admin123!`  
**CTO / PM:** seed yok — ADMIN ile oluşturulur.

---

## 1. Stack’i başlat

| | |
|--|--|
| **Aksiyon** | `docker compose --env-file .env.docker.example up --build` (veya manuel Postgres → backend → frontend) |
| **Beklenen** | Health `http://localhost:8080/api/v1/health` OK; UI açılır (Docker: `:3000`) |

---

## 2. ADMIN login

| | |
|--|--|
| **Aksiyon** | Login sayfasında seed ADMIN ile giriş |
| **Beklenen** | Dashboard / Projeler görünür; ADMIN menü (Kullanıcılar, Projeler) erişilebilir |

---

## 3. Yeni PROJECT_MANAGER oluştur

| | |
|--|--|
| **Aksiyon** | Kullanıcılar → yeni kullanıcı; rol `PROJECT_MANAGER`; benzersiz e-posta/şifre kaydet |
| **Beklenen** | Kullanıcı listesinde görünür; başarı geri bildirimi |

---

## 4. Yeni proje oluştur

| | |
|--|--|
| **Aksiyon** | Projeler → Yeni Proje; ad, kod, durum vb. doldur |
| **Beklenen** | Proje listesinde / detayda yeni proje görünür |

---

## 5. PM ata

| | |
|--|--|
| **Aksiyon** | Proje düzenle / atama UI’dan ana yönetici olarak oluşturulan PM’i seç |
| **Beklenen** | Projede project manager alanı PM kullanıcısını gösterir |

---

## 6. Ekip kullanıcısı ata

| | |
|--|--|
| **Aksiyon** | Proje detay **Ekip** sekmesi / assignment UI ile en az bir ekip üyesi ekle (gerekirse önce ikinci bir kullanıcı oluştur; roller yalnız `ADMIN` / `PROJECT_MANAGER` / `CTO`) |
| **Beklenen** | Atama listesinde üye görünür |

---

## 7. Logout

| | |
|--|--|
| **Aksiyon** | ADMIN çıkış |
| **Beklenen** | Login sayfasına dönülür; korumalı route’lara erişim yok |

---

## 8. PM login

| | |
|--|--|
| **Aksiyon** | Adım 3’teki PM e-posta/şifre ile giriş |
| **Beklenen** | PM paneli; ADMIN kullanıcı yönetimi menüsü yok / erişilemez |

---

## 9. Atanmış proje

| | |
|--|--|
| **Aksiyon** | Projeler / kendi projeleri listesinden atanan projeyi aç |
| **Beklenen** | Yalnız yetkili olduğu proje(ler) görünür; proje detay açılır |

---

## 10. Haftalık rapor oluştur

| | |
|--|--|
| **Aksiyon** | Haftalık rapor sekmesi/formu → yeni rapor (ilerleme, özet vb.) kaydet |
| **Beklenen** | Rapor listede; başarı toast/mesaj |

---

## 11. Work item ekle/güncelle

| | |
|--|--|
| **Aksiyon** | Work items sekmesinde yeni kalem ekle; durumu güncelle |
| **Beklenen** | Kalem listede; güncelleme yansır |

---

## 12. Risk ekle

| | |
|--|--|
| **Aksiyon** | Riskler sekmesinde yeni risk/issue kaydet |
| **Beklenen** | Risk listede görünür |

---

## 13. Logout

| | |
|--|--|
| **Aksiyon** | PM çıkış |
| **Beklenen** | Login sayfası |

---

## 14. CTO login

| | |
|--|--|
| **Aksiyon** | Önceden ADMIN ile oluşturulmuş CTO kullanıcısı ile giriş (yoksa ADMIN oturumuyla CTO oluşturup bu adıma dön) |
| **Beklenen** | CTO dashboard açılır |

---

## 15. Dashboard

| | |
|--|--|
| **Aksiyon** | Portföy KPI / sağlık dağılımı / proje kartlarına bak |
| **Beklenen** | Özet metrikler ve proje listesi yüklenir (empty değilse oluşturulan proje görünür) |

---

## 16. Attention Center

| | |
|--|--|
| **Aksiyon** | Portfolio Attention Center bölümünü incele |
| **Beklenen** | Mevcut portföy verisine göre dikkat skorları / kurallar listelenir (veri yoksa empty state) |

---

## 17. Project Detail

| | |
|--|--|
| **Aksiyon** | Demo projesine tıkla → Project Detail Command Center |
| **Beklenen** | Metrikler + sekmeler (rapor, WI, risk, ekip) açılır |

---

## 18. Executive Insight

| | |
|--|--|
| **Aksiyon** | Executive Project Insight kartını oku |
| **Beklenen** | Deterministik metin/skor gerçek alanlardan üretilir; AI çağrısı yok |

---

## 19. Weekly report

| | |
|--|--|
| **Aksiyon** | Haftalık rapor sekmesinde PM’in oluşturduğu raporu aç |
| **Beklenen** | İçerik okunabilir |

---

## 20. Team read-only kontrol

| | |
|--|--|
| **Aksiyon** | Ekip / atama görünümünde CTO olarak düzenleme dene |
| **Beklenen** | Yazma kontrolleri gizli veya disabled; API mutation reddedilir |

---

## 21. CTO mutation izinlerinin olmadığını doğrula

| | |
|--|--|
| **Aksiyon** | Rapor/WI/risk oluştur veya güncelle butonlarını dene (veya Network’te POST) |
| **Beklenen** | UI yazmayı engeller ve/veya backend **403**/yetkisiz yanıt |

---

## 22. Logout

| | |
|--|--|
| **Aksiyon** | CTO çıkış |
| **Beklenen** | Oturum kapanır; demo tamam |

---

## Notlar

- Unique e-posta/proje kodu kullanın (E2E ile aynı DB’yi paylaşıyorsanız çakışmayı önler).
- Docker’da API tarayıcıda `http://localhost:3000/api/v1` üzerinden gider; `backend:8080` hostname’i tarayıcıya verilmez.
- Bu senaryo ürün kodu değiştirmez; doğrulama + sunum checklist’idir.
