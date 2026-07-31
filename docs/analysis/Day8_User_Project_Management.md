# Kolaysoft CTO Dashboard

## 8. Gün User ve Project Management Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — User & Project Management |
| Tarih | 31 Temmuz 2026 |
| Sürüm | 1.1 |
| Durum | Day 8 tamamlandı |
| Kapsam dışı | Weekly Reports, Dashboard, Notifications, Frontend |

---

## 1. Purpose

Bu günün amacı, JWT kimlik doğrulama temelinin üzerine **User Management** ve **Project Management** CRUD API’lerini eklemektir.

Hedefler:

- Kullanıcıların yönetilmesi (oluşturma, listeleme, güncelleme, durum değiştirme, silme)
- Projelerin yönetilmesi (oluşturma, listeleme, güncelleme, yönetici/durum değişimi, silme)
- Rol bazlı yetkilendirme (`ADMIN`, `CTO`, `PROJECT_MANAGER`)
- Entity sızıntısı olmadan DTO tabanlı API sözleşmesi
- Bean Validation ile Türkçe doğrulama mesajları
- MockMvc testleri ve derleme doğrulaması

Bilinçli olarak yapılmayanlar:

- Haftalık rapor (Weekly Report) API’leri
- Dashboard aggregasyon endpointleri
- Bildirim sistemi
- Frontend ekranları

---

## 2. Implemented Architecture

Day 8, mevcut clean architecture katmanlarına uyumlu eklendi.

```text
Controller  →  Service (interface + impl)  →  Repository (JPA)
     ↓                    ↓
   DTO / Mapper      Business Rules
     ↓
 ApiResponse<T>
```

### Katman sorumlulukları

| Katman | Sorumluluk |
|---|---|
| Controller | HTTP mapping, Swagger dokümantasyonu, `@PreAuthorize` |
| Service | İş kuralları, benzersizlik, rol/manager doğrulaması |
| Repository | JOIN FETCH sorguları, unique kontrolleri |
| DTO / Mapper | Request/Response dönüşümü; entity dışarı verilmez |
| Exception | 400 / 403 / 404 / 409 standart `ApiResponse` cevapları |

### Eklenen / güncellenen ana bileşenler

| Bileşen | Açıklama |
|---|---|
| `UserController` / `UserService` / `UserServiceImpl` | Kullanıcı CRUD |
| `ProjectController` / `ProjectService` / `ProjectServiceImpl` | Proje CRUD |
| `UserMapper` / `ProjectMapper` | Entity ↔ Response dönüşümü |
| `FullNameParser` | `fullName` → `firstName` + `lastName` |
| `ConflictException` | 409 çakışma (email / code) |
| `BusinessRuleException` | 400 iş kuralı ihlali |
| `Project` entity | `code`, `manager` alanları eklendi |

### Mimari notlar

- `Project.endDate` veritabanı kolonu korunmuş; API’de `targetEndDate` olarak sunulur.
- Şifre yalnızca `passwordHash` olarak BCrypt ile saklanır; response’ta asla dönmez.
- Method security (`@EnableMethodSecurity` + `@PreAuthorize`) kullanılır.

---

## 3. User CRUD

### İş kuralları

- E-posta benzersizdir (normalize: trim + lower-case).
- Şifre BCrypt ile hashlenir.
- Varsayılan `active = true`.
- Roller: `ADMIN`, `PROJECT_MANAGER`, `CTO`.
- API’deki `fullName`, entity’de `firstName` / `lastName` olarak ayrılır.
- Güncellemede `password` opsiyoneldir; boşsa mevcut hash korunur.

### Operasyonlar

| İşlem | Davranış |
|---|---|
| List / Get | Rol bilgisi JOIN FETCH ile yüklenir |
| Create | Email unique kontrolü + BCrypt + default active |
| Update | Email unique (kendisi hariç), opsiyonel şifre yenileme |
| Patch status | `active` true/false |
| Delete | Kullanıcı kaydı silinir |

---

## 4. Project CRUD

### İş kuralları

- `code` benzersizdir (normalize: trim + upper-case).
- `manager` aktif kullanıcı olmalı ve rolü `PROJECT_MANAGER` olmalıdır.
- Create sırasında `status` boşsa varsayılan `PLANNED` atanır.
- Proje durumları: `PLANNED`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`.

### Operasyonlar

| İşlem | Davranış |
|---|---|
| List / Get | Manager bilgisi JOIN FETCH ile yüklenir |
| Create | Code unique + manager rol doğrulaması |
| Update | Code/manager/status/tarihler güncellenir |
| Patch manager | Yalnız yönetici değişir (rol kuralı uygulanır) |
| Patch status | Yalnız durum değişir |
| Delete | Proje kaydı silinir |

---

## 5. DTO Structure

Entity sınıfları API cevabında doğrudan kullanılmaz.

### User DTO’ları

| DTO | Alanlar |
|---|---|
| `CreateUserRequest` | `fullName`, `email`, `password`, `role` |
| `UpdateUserRequest` | `fullName`, `email`, `password?`, `role` |
| `UpdateUserStatusRequest` | `active` |
| `UserResponse` | `id`, `fullName`, `email`, `role`, `active`, `createdAt` |

### Project DTO’ları

| DTO | Alanlar |
|---|---|
| `CreateProjectRequest` | `code`, `name`, `description`, `managerId`, `status?`, `startDate`, `targetEndDate` |
| `UpdateProjectRequest` | `code`, `name`, `description`, `managerId`, `status`, `startDate`, `targetEndDate` |
| `UpdateProjectManagerRequest` | `managerId` |
| `UpdateProjectStatusRequest` | `status` |
| `ProjectResponse` | `id`, `code`, `name`, `description`, `managerId`, `managerFullName`, `managerEmail`, `status`, `startDate`, `targetEndDate`, `createdAt` |

### Ortak zarf

```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

---

## 6. Validation Rules

Jakarta Bean Validation kullanılır; mesajlar Türkçedir.

### User

| Alan | Kural | Mesaj örneği |
|---|---|---|
| `fullName` | `@NotBlank` | Ad soyad zorunludur. |
| `email` | `@NotBlank`, `@Email` | Geçerli bir e-posta adresi giriniz. |
| `password` | `@NotBlank`, `@Size(min=8)` | Şifre en az 8 karakter olmalıdır. |
| `role` | `@NotNull` | Rol zorunludur. |

### Project

| Alan | Kural | Mesaj örneği |
|---|---|---|
| `code` | `@NotBlank` | Proje kodu zorunludur. |
| `name` | `@NotBlank` | Proje adı zorunludur. |
| `managerId` | `@NotNull` | Proje yöneticisi zorunludur. |
| `status` (update/patch) | `@NotNull` | Proje durumu zorunludur. |

### Validation hata cevabı (HTTP 400)

```json
{
  "success": false,
  "message": "Doğrulama hatası.",
  "data": {
    "email": "Geçerli bir e-posta adresi giriniz."
  }
}
```

### İş kuralı / çakışma hataları

| Durum | HTTP | Mesaj |
|---|---|---|
| E-posta çakışması | 409 | Bu e-posta adresi zaten kullanılmaktadır. |
| Proje kodu çakışması | 409 | Bu proje kodu zaten kullanılmaktadır. |
| Manager rolü hatalı | 400 | Proje yöneticisi PROJECT_MANAGER rolüne sahip olmalıdır. |
| Kayıt yok | 404 | Kullanıcı / Proje bulunamadı. |

---

## 7. Authorization Rules

Day 7 JWT authentication üzerine method-level authorization eklendi.

| Rol | Users | Projects |
|---|---|---|
| `ADMIN` | Tam CRUD | Tam CRUD |
| `CTO` | Salt okuma (`GET`) | Salt okuma (`GET`) |
| `PROJECT_MANAGER` | Erişim yok | Erişim yok |

Ek güvenlik sonuçları:

- Token yok / geçersiz → HTTP `401`  
  Mesaj: `Bu işlemi gerçekleştirmek için giriş yapmalısınız.`
- Authenticated ama yetkisiz → HTTP `403`  
  Mesaj: `Bu işlem için yetkiniz bulunmamaktadır.`

Uygulama: controller metotlarında `@PreAuthorize("hasRole('ADMIN')")` ve `@PreAuthorize("hasAnyRole('ADMIN', 'CTO')")`.

---

## 8. API Endpoints

Base path: `/api/v1`

### Users

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/users` | ADMIN, CTO | Kullanıcı listesi |
| `GET` | `/users/{id}` | ADMIN, CTO | Kullanıcı detayı |
| `POST` | `/users` | ADMIN | Kullanıcı oluşturma |
| `PUT` | `/users/{id}` | ADMIN | Kullanıcı güncelleme |
| `PATCH` | `/users/{id}/status` | ADMIN | Aktif/pasif durumu |
| `DELETE` | `/users/{id}` | ADMIN | Kullanıcı silme |

### Projects

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/projects` | ADMIN, CTO | Proje listesi |
| `GET` | `/projects/{id}` | ADMIN, CTO | Proje detayı |
| `POST` | `/projects` | ADMIN | Proje oluşturma |
| `PUT` | `/projects/{id}` | ADMIN | Proje güncelleme |
| `PATCH` | `/projects/{id}/manager` | ADMIN | Yönetici atama |
| `PATCH` | `/projects/{id}/status` | ADMIN | Durum güncelleme |
| `DELETE` | `/projects/{id}` | ADMIN | Proje silme |

### Örnek create user isteği

```json
{
  "fullName": "Ali Veli",
  "email": "ali.veli@kolaysoft.com.tr",
  "password": "Password1",
  "role": "PROJECT_MANAGER"
}
```

### Örnek create project isteği

```json
{
  "code": "PRJ-001",
  "name": "CTO Dashboard",
  "description": "Haftalık takip",
  "managerId": 2,
  "status": "PLANNED",
  "startDate": "2026-08-01",
  "targetEndDate": "2026-12-31"
}
```

---

## 9. Swagger Screenshots (Reference Only)

Swagger UI adresi:

http://localhost:8080/swagger-ui/index.html

Doğrulama için beklenen ekran referansları (bu dokümana görsel eklenmemiştir):

1. **Authorize** — JWT Bearer token girişi (`bearerAuth`)
2. **Users** tag — 6 endpoint listesi ve Try it out
3. **Projects** tag — 7 endpoint listesi ve Try it out
4. Başarılı `POST /users` veya `POST /projects` cevabı (`ApiResponse` zarfı)
5. Yetkisiz istekte `401` / `403` JSON cevabı

Not: Canlı ortamda login ile alınan `accessToken`, Authorize alanına `Bearer` yazılmadan girilir.

---

## 10. Test Results

Test yaklaşımı: `@WebMvcTest` + MockMvc + `@WithMockUser` + service mock.

### Day 8 senaryoları

| Test sınıfı | Senaryo | Beklenen |
|---|---|---|
| `UserControllerTest` | User create (ADMIN) | 201 |
| `UserControllerTest` | User list (ADMIN) | 200 |
| `UserControllerTest` | Unauthorized | 401 |
| `UserControllerTest` | Forbidden (PROJECT_MANAGER) | 403 |
| `UserControllerTest` | Validation | 400 |
| `UserControllerTest` | CTO read | 200 |
| `ProjectControllerTest` | Project create (ADMIN) | 201 |
| `ProjectControllerTest` | Project list (ADMIN) | 200 |
| `ProjectControllerTest` | Unauthorized | 401 |
| `ProjectControllerTest` | Forbidden (PROJECT_MANAGER) | 403 |
| `ProjectControllerTest` | CTO read | 200 |
| `ProjectControllerTest` | CTO create forbidden | 403 |
| `ProjectControllerTest` | Validation | 400 |

### Toplam surefire özeti (31 Temmuz 2026)

| Test sınıfı | Tests | Failures | Errors |
|---|---:|---:|---:|
| `AuthControllerTest` | 5 | 0 | 0 |
| `HealthControllerTest` | 1 | 0 | 0 |
| `UserControllerTest` | 6 | 0 | 0 |
| `ProjectControllerTest` | 7 | 0 | 0 |
| `JwtServiceTest` | 2 | 0 | 0 |
| `AuthServiceImplTest` | 4 | 0 | 0 |
| **Toplam** | **25** | **0** | **0** |

---

## 11. Build Result

Komut:

```powershell
cd backend/cto-dashboard-api
./mvnw clean package
```

Sonuç:

| Kontrol | Değer |
|---|---|
| Tests run | 25 |
| Failures | 0 |
| Errors | 0 |
| Skipped | 0 |
| Maven sonucu | **BUILD SUCCESS** |
| Üretilen artefakt | `target/cto-dashboard-api-0.0.1-SNAPSHOT.jar` |

Canlı doğrulama (aynı gün, PostgreSQL Docker ile):

- Health → `UP`
- Login → başarılı (`ADMIN`)
- `GET /api/v1/users` → token ile 200
- `GET /api/v1/projects` → token ile 200
- Swagger UI → HTTP 200

---

## 12. Problems Encountered

1. **Day 6 Project modeli eksikti.** `code` ve `manager` alanları yoktu; Day 8 sözleşmesi bunları zorunlu kılıyordu.
2. **User entity `fullName` kolonu taşımıyor.** API `fullName` isterken entity `firstName` / `lastName` kullanıyor.
3. **`targetEndDate` adı ile `end_date` kolonu farklıydı.** Mevcut şemayı bozmadan eşleme gerekiyordu.
4. **Method security 403 cevapları 500’e düşüyordu.** `@PreAuthorize` reddi `AuthorizationDeniedException` ürettiğinde genel exception handler yakalıyordu.
5. **PROJECT_MANAGER için erişim bilinçli olarak kapatıldı.** Bu rolün kendi projelerine sınırlı erişimi henüz yok; Day 8 kapsamında bu doğru kabul edildi.

---

## 13. Solutions

1. `Project` entity ve `database/schema.sql` güncellendi: `code` (unique), `manager_id` (FK → users).
2. `FullNameParser` ile `fullName` güvenli biçimde `firstName` / `lastName`’e ayrıldı.
3. DTO katmanında `targetEndDate` ↔ entity `endDate` eşlemesi yapıldı.
4. `GlobalExceptionHandler` içine `AccessDeniedException` / `AuthorizationDeniedException` → HTTP 403 JSON eklendi.
5. Controller seviyesinde rol matrisi netleştirildi; PROJECT_MANAGER erişimi sonraki güne bırakıldı.

---

## 14. Next Day Plan

Önerilen Day 9 kapsamı:

1. **Project Assignment** yönetimi (kullanıcı–proje ataması)
2. **Weekly Report** CRUD başlangıcı
3. `PROJECT_MANAGER` için yalnızca kendi yönettiği projelere sınırlı erişim
4. Flyway / versioned migration geçişi (`ddl-auto=update` bağımlılığını azaltma)
5. Gerekirse sayfalama (`Pageable`) ve arama filtreleri

---

## 15. Sonuç

Day 8 hedefi tamamlanmıştır. User ve Project yönetim API’leri DTO, validation, yetkilendirme ve testlerle birlikte çalışır durumdadır. Weekly Report, Dashboard ve Notification kapsam dışı bırakılmıştır.
