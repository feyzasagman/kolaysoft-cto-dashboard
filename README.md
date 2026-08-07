# Kolaysoft CTO Dashboard

## Weekly Project Status Reporting and CTO Tracking System

Kolaysoft Yaz Stajı 2026 kapsamında geliştirilen proje.

## Technologies

- React 18 + Vite + TypeScript
- Spring Boot
- PostgreSQL
- REST API
- Swagger
- Material UI
- TanStack Query
- Axios

## Frontend

### Gereksinimler

- Node.js 20+
- npm

### Çalıştırma

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Uygulama: http://localhost:5173

Varsayılan API adresi: `http://localhost:8080/api/v1` (`VITE_API_BASE_URL`)

### Day 12 kapsamı

- Login (`POST /api/v1/auth/login`) + JWT localStorage
- Dashboard layout (Sidebar / Topbar)
- Protected routes + rol koruması
- Dashboard summary kartları
- Projects / Reports / Users listeleri
- Axios interceptors + global error handling
- Refresh token placeholder
- Project Manager haftalık rapor / iş kalemi / risk akışı

Ayrıntılar:
- `docs/analysis/Day12_React_Frontend_Setup.md`
- `docs/analysis/Day12_Weekly_Report_WorkItem_Risk_Frontend.md`

### Day 13 — CTO Dashboard MVP

- Rol bazlı başlık: CTO / Yönetim / Proje Genel Bakış
- 6 KPI kartı: toplam, aktif, tamamlanan, açık risk, kritik risk, eksik haftalık rapor
- Sağlık dağılımı (`health-distribution`)
- Proje portföy tablosu (`dashboard/projects`)
- Kritik risk önizlemesi (`critical-risks`)
- `dashboardMapper` ile null-güvenli dönüşüm
- ADMIN/CTO genel dashboard; PROJECT_MANAGER genel dashboard’a erişmez

Endpointler:

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/health-distribution`
- `GET /api/v1/dashboard/critical-risks`
- `GET /api/v1/dashboard/projects`

Demo adımları:

1. ADMIN veya CTO ile giriş
2. `/dashboard` → KPI, sağlık, portföy tablosu
3. Yenile butonu ile refetch
4. Satırdan **Detayı Gör** → `/projects/:id`

Ayrıntılar: `docs/analysis/Day13_CTO_Dashboard_MVP.md`

### Day 14 — Dashboard filtreleri ve proje detayı

- Dashboard filtreleri (URL query senkron): search, projectStatus, health, managerId, hasCurrentWeekReport, riskLevel, sort, page, size
- Proje detay ekranı: `/projects/:projectId` (`GET /dashboard/projects/{id}` + rapor/risk/iş kalemi zenginleştirme)
- Detay alanları: temel bilgi, ilerleme özeti, son haftalık rapor, risk/engel, aktif iş kalemleri, son 5 rapor
- Rol bazlı erişim: ADMIN/CTO tüm detay; PM yalnızca atanmış proje; CTO salt okunur
- Dashboard → detay → geri dönüşte filtre/pagination URL’de korunur

Endpointler:

- `GET /api/v1/dashboard/projects` (filtre + sayfalama)
- `GET /api/v1/dashboard/projects/{projectId}`
- `GET /api/v1/reports/{id}`, `GET /api/v1/reports/project/{projectId}`
- `GET /api/v1/work-items?reportId=`, risk listesi (`reportId`)

Demo adımları:

1. ADMIN/CTO ile giriş → `/dashboard`
2. Durum / sağlık / arama filtrelerini uygula; URL’de parametreleri kontrol et
3. Sayfa boyutu 10/20/50 ve sıralama değiştir
4. **Detayı Gör** → proje bilgisi, son rapor, risk, iş kalemi, geçmiş
5. **Geri Dön** → filtrelerin korunduğunu doğrula
6. PM: kendi proje detayı + rapor oluştur; başka proje URL → 403

Filtre örneği:

```
/dashboard?projectStatus=ACTIVE&health=GREEN&hasCurrentWeekReport=false&page=0&size=20&sort=name,asc
```

Bilinen eksikler (Day 14):

- Sort allowlist: `name`, `code`, `status`, `createdAt`, `id` (ilerleme/risk/son rapor tarihi yok)
- `customer` DTO’da yok → UI `—`
- Rapor geçmişi DTO’da `reportId` yok → yıl+hafta eşlemesi
- Proje düzenleme route’u yok → “Projeyi Düzenle” butonu yok

Ayrıntılar: `docs/analysis/Day14_Dashboard_Project_Detail_and_Filters.md`

### Frontend ortam değişkeni

`frontend/.env` (örnek: `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Çalıştırma sırası

1. PostgreSQL (Docker) ayakta olsun
2. Backend: `backend/cto-dashboard-api` → `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`
3. Frontend: `cd frontend` → `npm run dev`
4. Aç: http://localhost:5173

### Demo kullanıcıları (yalnızca geliştirme)

| Rol | E-posta | Şifre |
|---|---|---|
| ADMIN (seed) | `admin@kolaysoft.com.tr` | `Admin123!` |
| PROJECT_MANAGER / CTO | Seed yok; ADMIN ile `POST /users` üzerinden oluşturulur | — |

### Project Manager demo akışı

1. ADMIN ile PM kullanıcı + atanmış proje oluşturun
2. PM olarak giriş yapın → `/projects`
3. İlk görünürlük için `/reports/new?projectId={id}` veya proje detayından **Haftalık Rapor Oluştur**
4. Raporu kaydedin → `/reports/:id`
5. İş kalemi ve risk ekleyin / durum güncelleyin
6. CTO ile giriş yapıp aynı raporu salt okunur görüntüleyin (Düzenle gizli)

### Bilinen eksikler

- Backend’de PM için `GET /projects` / `GET /dashboard/projects` listesi yok (403); frontend raporlar + bilinen proje id önbelleği ile telafi eder
- `customer` alanı entity’de var, response DTO’da yok → UI’da `—`
- Dashboard sort alanları ilerleme / açık risk / son rapor tarihini kapsamıyor
- Rapor history DTO’sunda `reportId` yok
- Frontend unit test kütüphanesi yok (vitest/RTL eklenmedi)
- Refresh token endpointi yok

## Backend

### Gereksinimler

- Java 21
- Maven Wrapper veya Maven
- PostgreSQL

### Veritabanı Hazırlığı

PostgreSQL üzerinde `cto_dashboard` adında bir veritabanı oluşturun. Gerçek bağlantı bilgilerini
repository'ye eklemeyin; ortam değişkenleri üzerinden sağlayın.

Şema **Flyway** migration ile yönetilir (`ddl-auto=validate`). Referans SQL (döküman): `database/schema.sql`

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

Üretim profili için `SPRING_PROFILES_ACTIVE=prod` kullanın. Üretimde `ddl-auto=validate` ve Flyway aktiftir;
şifre ve bağlantı bilgileri zorunlu ortam değişkenlerinden okunur.

### Database Migration

Şema değişiklikleri Flyway ile versiyonlanır. Hibernate tabloları otomatik oluşturmaz/güncellemez (`ddl-auto=validate`).

**Migration klasörü**

`backend/cto-dashboard-api/src/main/resources/db/migration`

| Dosya | Açıklama |
|---|---|
| `V1__init_schema.sql` | Entity modeline dayalı ilk şema |

`database/sample_data.sql` boştur; demo/admin kullanıcılar migration’a taşınmaz. Dev seed: `DevDataInitializer` (`dev` profili).

**Yeni migration ekleme**

1. `V{n}__kisa_aciklama.sql` oluşturun (ör. `V2__add_project_index.sql`)
2. Yalnızca DDL yazın (`CREATE`/`ALTER`); demo veri eklemeyin
3. Uygulamayı başlatın — Flyway sırayla uygular
4. Entity ile migration’ı senkron tutun; entity’yi migration’a uydurmak için tersine çevirmeyin

**Temiz kurulum (boş veritabanı)**

```powershell
# Docker örneği: yeni DB
docker exec -it cto-dashboard-postgres psql -U postgres -c "CREATE DATABASE cto_dashboard;"

cd backend/cto-dashboard-api
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5432/cto_dashboard"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```

İlk açılışta V1 çalışır, `flyway_schema_history` oluşur, `DevDataInitializer` roller + admin seed eder.

**Mevcut dolu development DB için baseline (tek seferlik)**

Eski `cto_dashboard` Hibernate `ddl-auto=update` ile oluşmuş olabilir ve `flyway_schema_history` yoktur.
Bu durumda uygulamayı doğrudan başlatmak V1’i yeniden çalıştırmaya çalışır ve **çakışır**.

Kodda `baseline-on-migrate` **yoktur**. Tek seferlik baseline (önerilen):

```powershell
# Flyway Docker image — mevcut tabloları silmeden şemayı V1 olarak işaretler
docker run --rm `
  --network host `
  -v "${PWD}/backend/cto-dashboard-api/src/main/resources/db/migration:/flyway/sql" `
  flyway/flyway:11 `
  -url="jdbc:postgresql://localhost:5432/cto_dashboard" `
  -user="postgres" `
  -password="postgres" `
  baseline -baselineVersion="1" -baselineDescription="init schema"
```

Windows’ta `--network host` sorun çıkarırsa host IP kullanın:

```powershell
docker run --rm `
  -v "${PWD}/flyway-sql:/flyway/sql" `
  flyway/flyway:11 `
  -url="jdbc:postgresql://host.docker.internal:5432/cto_dashboard" `
  -user="postgres" `
  -password="postgres" `
  baseline -baselineVersion="1" -baselineDescription="init schema"
```

(`flyway-sql` klasörüne migration dosyalarını kopyalayın veya volume yolunu doğrudan `db/migration` yapın.)

CLI kuruluysa:

```powershell
flyway -url="jdbc:postgresql://localhost:5432/cto_dashboard" `
  -user=postgres -password=postgres `
  -locations="filesystem:backend/cto-dashboard-api/src/main/resources/db/migration" `
  baseline -baselineVersion=1 -baselineDescription="init schema"
```

Baseline sonrası uygulamayı normal başlatın. Sonraki şema değişiklikleri `V2+` olarak eklenir.

**Not:** `cto_dashboard_flyway_test` gibi boş bir DB ile Flyway’i doğrulamak baseline gerektirmez.

### Test

```powershell
cd backend/cto-dashboard-api
./mvnw test
```

MVP test turu raporu: [`docs/testing/Day15_MVP_Test_Report.md`](docs/testing/Day15_MVP_Test_Report.md)  
Açık hatalar: [`docs/testing/Day15_Bug_List.md`](docs/testing/Day15_Bug_List.md)

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

### API Optimizasyonu (Day 11)

Liste endpointleri `ApiResponse<PageResponse<T>>` döner.

Ortak query parametreleri:

- `page` (default `0`)
- `size` (default `20`, max `100`)
- `sort` (`alan,asc|desc`, allow-list)
- `search` (opsiyonel metin araması)

Ek filtre örnekleri:

- Users: `role`, `active`
- Projects: `status`, `managerId`
- Reports: `projectId`, `year`, `weekNumber`
- Work Items: `reportId`, `status`
- Risks: `reportId`, `riskLevel`, `status`

Hata yanıtı `data` alanında `ErrorDetail` (`code`, `path`, `timestamp`, `fields`) taşır.
Her istek `X-Request-Id` alır; loglarda MDC `requestId` ile izlenir.

Ayrıntılar: `docs/analysis/Day11_API_Optimization.md`

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
