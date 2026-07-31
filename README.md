# Kolaysoft CTO Dashboard

## Weekly Project Status Reporting and CTO Tracking System

Kolaysoft Yaz Stajı 2026 kapsamında geliştirilen proje.

## Technologies

- React
- Spring Boot
- PostgreSQL
- REST API
- Swagger

## Backend

### Gereksinimler

- Java 21
- Maven Wrapper veya Maven
- PostgreSQL

### Veritabanı Hazırlığı

PostgreSQL üzerinde `cto_dashboard` adında bir veritabanı oluşturun. Gerçek bağlantı bilgilerini
repository'ye eklemeyin; ortam değişkenleri üzerinden sağlayın.

Geliştirme ortamında Hibernate `ddl-auto=update` ile tablolar entity modelinden otomatik oluşturulur.
Referans SQL şeması: `database/schema.sql`

Gerekli ortam değişkenleri:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SPRING_PROFILES_ACTIVE` (varsayılan: `dev`)

Örnek Docker ile yerel PostgreSQL:

```powershell
docker run -d --name cto-dashboard-postgres `
  -e POSTGRES_DB=cto_dashboard `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=your_password `
  -p 5432:5432 postgres:16-alpine
```

### Çalıştırma

```powershell
cd backend/cto-dashboard-api
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5432/cto_dashboard"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
./mvnw spring-boot:run
```

Üretim profili için `SPRING_PROFILES_ACTIVE=prod` kullanın. Üretimde `ddl-auto=validate` aktiftir;
şifre ve bağlantı bilgileri zorunlu ortam değişkenlerinden okunur.

### Test

```powershell
cd backend/cto-dashboard-api
./mvnw test
```

### Swagger

Uygulama çalışırken Swagger arayüzü:

http://localhost:8080/swagger-ui/index.html

### Health

Uygulama çalışma durumu:

http://localhost:8080/api/v1/health

### Authentication (Day 7)

JWT tabanlı login endpointi:

`POST /api/v1/auth/login`

JWT ortam değişkenleri (gerçek secret değerini repository'ye eklemeyin):

```powershell
$env:JWT_SECRET="en-az-32-karakter-uzunlugunda-guvenli-bir-secret"
$env:JWT_EXPIRATION_MS="3600000"
```

- `JWT_SECRET` — üretimde zorunlu; `dev` profilinde yalnızca local fallback vardır
- `JWT_EXPIRATION_MS` — varsayılan: `3600000` (1 saat)

Geliştirme ortamında (`dev` profili) otomatik seed admin kullanıcısı oluşturulur.
Bu hesap yalnızca local geliştirme içindir; üretimde kullanılmamalıdır.

- E-posta: `admin@kolaysoft.com.tr`
- Şifre: `Admin123!`

Örnek login isteği:

```powershell
curl -X POST http://localhost:8080/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@kolaysoft.com.tr\",\"password\":\"Admin123!\"}"
```

Başarılı cevap `data.accessToken` alanında JWT döner (`tokenType: Bearer`).
Korunan endpointlere istek atarken:

```text
Authorization: Bearer <accessToken>
```

#### Swagger Authorize kullanımı

1. Login endpointinden `accessToken` alın.
2. Swagger UI üzerindeki **Authorize** butonuna tıklayın.
3. Yalnızca token değerini girin (`Bearer` yazmayın).
4. Korumalı endpointleri test edin.

Hata kodları:

- `401` — e-posta bulunamadı veya şifre hatalı (aynı genel mesaj)
- `403` — kullanıcı hesabı aktif değil
- `400` — doğrulama hatası

Ayrıntılar: `docs/analysis/Day7_Authentication_and_JWT.md`

### User & Project Management (Day 8)

#### Yetkilendirme

| Rol | Users | Projects |
|---|---|---|
| `ADMIN` | Tam CRUD | Tam CRUD |
| `CTO` | Salt okuma | Salt okuma |
| `PROJECT_MANAGER` | Erişim yok | Erişim yok |

#### User endpointleri

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}/status`
- `DELETE /api/v1/users/{id}`

#### Project endpointleri

- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `POST /api/v1/projects`
- `PUT /api/v1/projects/{id}`
- `PATCH /api/v1/projects/{id}/manager`
- `PATCH /api/v1/projects/{id}/status`
- `DELETE /api/v1/projects/{id}`

İş kuralları:

- E-posta ve proje kodu benzersizdir.
- Şifre BCrypt ile hashlenir; API cevaplarında dönmez.
- Proje yöneticisi `PROJECT_MANAGER` rolünde ve aktif olmalıdır.
- Proje durumları: `PLANNED`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`

Ayrıntılar: `docs/analysis/Day8_User_Project_Management.md`

### Weekly Report Module (Day 9)

#### Yetkilendirme

| Rol | Reports / Work Items / Risks |
|---|---|
| `ADMIN` | Tam yönetim |
| `CTO` | Salt okuma |
| `PROJECT_MANAGER` | Yalnız kendi projeleri |

#### Report endpointleri

- `GET /api/v1/reports`
- `GET /api/v1/reports/{id}`
- `GET /api/v1/reports/project/{projectId}`
- `POST /api/v1/reports`
- `PUT /api/v1/reports/{id}`
- `DELETE /api/v1/reports/{id}`

#### Work Item endpointleri

- `GET /api/v1/work-items`
- `POST /api/v1/work-items`
- `PUT /api/v1/work-items/{id}`
- `DELETE /api/v1/work-items/{id}`

#### Risk endpointleri

- `GET /api/v1/risks`
- `POST /api/v1/risks`
- `PUT /api/v1/risks/{id}`
- `DELETE /api/v1/risks/{id}`

İş kuralları:

- Aynı proje + hafta numarası için tek rapor (`409 Conflict`)
- `weekNumber` 1–53, progress 0–100
- WorkItem ve Risk bir Weekly Report’a bağlıdır

Ayrıntılar: `docs/analysis/Day9_Weekly_Report_Module.md`

### CTO Dashboard Backend (Day 10)

#### Yetki matrisi

| Endpoint | ADMIN | CTO | PROJECT_MANAGER |
|---|---|---|---|
| `/dashboard/summary` | Evet | Evet | Hayir |
| `/dashboard/health-distribution` | Evet | Evet | Hayir |
| `/dashboard/critical-risks` | Evet | Evet | Hayir |
| `/dashboard/latest-reports` | Evet | Evet | Hayir |
| `/dashboard/projects` | Evet | Evet | Hayir |
| `/dashboard/projects/{id}` | Evet | Evet | Yalniz kendi projesi |

#### Endpointler

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/health-distribution`
- `GET /api/v1/dashboard/critical-risks?level=&status=&projectId=&limit=10`
- `GET /api/v1/dashboard/latest-reports?projectId=&managerId=&health=&status=&year=&weekNumber=&limit=10`
- `GET /api/v1/dashboard/projects?search=&managerId=&projectStatus=&health=&page=0&size=20&sort=name,asc`
- `GET /api/v1/dashboard/projects/{projectId}`

#### Swagger üzerinden test

1. Login ile JWT alın.
2. Swagger **Authorize** ile token girin.
3. **Dashboard** tag altındaki endpointleri çalıştırın.
4. PROJECT_MANAGER token’ı ile summary çağırarak `403` doğrulayın.

Ayrıntılar: `docs/analysis/Day10_CTO_Dashboard_Backend.md`

### Veri Modeli (Day 6)

JPA entity'ler:

- `Role`
- `User`
- `Project`
- `ProjectAssignment`
- `WeeklyReport`
- `WorkItem`
- `RiskIssue`

Ayrıntılar: `docs/analysis/Day6_Database_Integration.md`
