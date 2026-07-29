# Kolaysoft CTO Dashboard

## 7. Gün Authentication ve JWT Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Authentication ve JWT Mimari Raporu |
| Tarih | 29 Temmuz 2026 |
| Sürüm | 1.1 |
| Durum | Day 7 tamamlandı; registration / refresh token / CRUD yok |

---

## 1. Günün amacı

JWT tabanlı kimlik doğrulama temelini kurmak:

- Login API
- BCrypt şifre doğrulama
- Stateless Spring Security
- Swagger Bearer Authentication
- Login ve güvenlik testleri

Kapsam dışı:

- Registration
- Refresh token
- User / Project CRUD
- Frontend authentication UI
- Rol bazlı endpoint yetkilendirme genişletmesi

---

## 2. Mevcut durum

Day 1–6 tamamlanmıştı:

- Spring Boot 3 / Java 21 iskeleti
- PostgreSQL bağlantısı
- User, Role ve diğer entity'ler
- Repository katmanı
- Health endpoint
- Swagger/OpenAPI

Day 7 öncesi gerçek JWT login akışı yoktu. Bu günde mevcut User/Role yapılarına uyumlu authentication eklendi.

---

## 3. Authentication akışı

1. İstemci `POST /api/v1/auth/login` ile e-posta ve şifre gönderir.
2. `AuthController` isteği validation sonrası `AuthService`'e iletir.
3. `AuthenticationManager` + `DaoAuthenticationProvider` e-posta/şifre doğrular.
4. Kullanıcı bulunamazsa veya şifre yanlışsa aynı genel mesaj ile `401` döner.
5. Pasif kullanıcı için `403` döner.
6. Başarılı doğrulamada `JwtService` access token üretir.
7. Cevapta `accessToken`, `tokenType`, `expiresIn`, kullanıcı bilgileri döner.
8. Sonraki isteklerde `Authorization: Bearer <token>` gönderilir.
9. `JwtAuthenticationFilter` token'ı doğrular ve `SecurityContext` kurar.

---

## 4. BCrypt yaklaşımı

`PasswordEncoder` bean'i `BCryptPasswordEncoder` olarak tanımlanmıştır.

- Veritabanında yalnızca `password_hash` tutulur.
- Düz metin şifre API cevaplarında veya loglarda yer almaz.
- `dev` profilindeki seed admin şifresi BCrypt ile hashlenerek kaydedilir.

---

## 5. JWT mimarisi

### Yapılandırma

```yaml
security:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: ${JWT_EXPIRATION_MS:3600000}
```

- Gerçek secret kaynak koda yazılmaz.
- `dev` profilinde local fallback secret vardır; üretimde `JWT_SECRET` zorunludur.
- Varsayılan süre: 1 saat (`3600000` ms).

### JwtService metotları

- `generateToken(UserDetails userDetails)`
- `extractUsername(String token)`
- `extractExpiration(String token)`
- `isTokenValid(String token, UserDetails userDetails)`
- `isTokenExpired(String token)`

Subject alanı e-posta adresidir. Claims içinde yalnızca gerekli alanlar (`userId`, `role`) taşınır.

### Filter

`JwtAuthenticationFilter` (`OncePerRequestFilter`):

- Header yoksa hata üretmeden devam eder.
- Geçersiz token 500 üretmez.
- Token değeri loglanmaz.

---

## 6. Oluşturulan / güncellenen sınıflar

| Sınıf | Rol |
|---|---|
| `JwtService` | Token üretimi ve doğrulama |
| `JwtAuthenticationFilter` | Bearer token işleme |
| `JwtAuthenticationEntryPoint` | JSON 401 |
| `JwtAccessDeniedHandler` | JSON 403 |
| `CustomUserDetails` | UserDetails adaptörü (`ROLE_*`) |
| `CustomUserDetailsService` | E-posta ile kullanıcı yükleme |
| `PasswordEncoderConfig` | BCrypt bean |
| `SecurityConfig` | Stateless JWT security |
| `LoginRequest` / `LoginResponse` | Login DTO'ları |
| `AuthService` / `AuthServiceImpl` | Login iş kuralı |
| `AuthController` | `POST /api/v1/auth/login` |
| `DevDataInitializer` | Dev-only seed admin |

---

## 7. Login API sözleşmesi

### Endpoint

`POST /api/v1/auth/login`

### Request

```json
{
  "email": "admin@kolaysoft.com.tr",
  "password": "Admin123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "accessToken": "...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "userId": 1,
    "fullName": "System Admin",
    "email": "admin@kolaysoft.com.tr",
    "role": "ADMIN"
  }
}
```

`LoginResponse` entity döndürmez; yalnızca gerekli alanları içerir.

---

## 8. SecurityConfig kararları

- CSRF kapalı
- `SessionCreationPolicy.STATELESS`
- Form login / HTTP Basic kapalı
- Public:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/health`
  - `/swagger-ui/**`, `/v3/api-docs/**`, `/swagger-ui.html`
- Diğer tüm istekler: `authenticated()`
- `DaoAuthenticationProvider` + `AuthenticationManager`
- CORS mevcut React origin ayarlarıyla korunur
- Rol bazlı endpoint kuralları henüz genişletilmedi

---

## 9. Swagger Bearer Authentication

OpenAPI `bearerAuth` scheme:

- type: HTTP
- scheme: bearer
- bearerFormat: JWT

Swagger UI: http://localhost:8080/swagger-ui/index.html

Authorize butonu görünür. Login ve health endpointleri `@SecurityRequirements` ile public işaretlenmiştir.

---

## 10. Hata cevapları

| Durum | HTTP | Mesaj |
|---|---|---|
| E-posta yok / şifre hatalı | 401 | E-posta adresi veya şifre hatalı. |
| Kullanıcı pasif | 403 | Kullanıcı hesabı aktif değildir. |
| Validation | 400 | Doğrulama hatası. (+ alan detayları) |
| Token yok (korumalı endpoint) | 401 | Bu işlemi gerçekleştirmek için giriş yapmalısınız. |
| Yetki yok | 403 | Bu işlem için yetkiniz bulunmamaktadır. |

---

## 11. Test senaryoları ve sonuçları

Senaryolar:

1. Geçerli login → 200, `accessToken` dolu, `tokenType=Bearer`
2. Yanlış şifre → 401, genel mesaj
3. Geçersiz request → 400
4. Token olmadan korumalı endpoint → 401 JSON
5. Health token olmadan → 200
6. JwtService generate/validate unit testleri
7. AuthService unit testleri (AuthenticationManager mock)

Komutlar:

```powershell
cd backend/cto-dashboard-api
./mvnw test
./mvnw clean package
```

Doğrulanan sonuçlar (29 Temmuz 2026):

- `./mvnw test` → Tests run: 12, Failures: 0, Errors: 0, BUILD SUCCESS
- `./mvnw clean package -DskipTests` → BUILD SUCCESS

Canlı PostgreSQL doğrulaması:

- Docker Desktop kapalı olduğu için `cto-dashboard-postgres` başlatılamadı.
- `localhost:5432` dinlemiyor.
- Bu nedenle gerçek login ve Swagger Authorize canlı denemesi bu ortamda çalıştırılamadı.
- MockMvc/unit testler login, 401/403/400 ve token’sız korumalı erişimi doğruladı.

---

## 12. Karşılaşılan problemler

1. Önceki login cevabı `token` alanını kullanıyordu; spesifikasyon `accessToken` + `tokenType` + `expiresIn` istiyordu.
2. Kullanıcı bulunamadığında 404 dönmek bilgi sızıntısı riski oluşturuyordu; 401 genel mesaja çekildi.
3. EntryPoint/AccessDeniedHandler olmadan Spring varsayılan HTML/boş cevapları JSON sözleşmesini bozuyordu.
4. Lazy `Role` erişimi login sırasında problem çıkarabilirdi; `findByEmailWithRole` JOIN FETCH kullanıldı.

---

## 13. Çözüm yolları

1. `LoginResponse` ve controller mesajı spesifikasyona hizalandı.
2. `AuthenticationManager` + aynı 401 mesajı uygulandı.
3. `JwtAuthenticationEntryPoint` / `JwtAccessDeniedHandler` eklendi.
4. Dev seed admin BCrypt hash ile oluşturuldu.

---

## 14. Açık kalan konular

- Registration yok
- Refresh token yok
- `/api/v1/auth/me` yok
- Rol bazlı endpoint yetkilendirme genişletmesi yok
- User/Project CRUD yok
- Flyway migration henüz yok (`dev` ddl-auto=update)

---

## 15. Sonraki gün planı

1. `GET /api/v1/auth/me`
2. Role-based authorization örnekleri (`ADMIN` / `PROJECT_MANAGER` / `CTO`)
3. Admin user management CRUD başlangıcı
4. Flyway migration geçişi
