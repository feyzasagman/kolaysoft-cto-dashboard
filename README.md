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
