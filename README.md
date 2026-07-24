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

### Çalıştırma

```powershell
cd backend/cto-dashboard-api
$env:DB_URL="jdbc:postgresql://localhost:5432/cto_dashboard"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
./mvnw spring-boot:run
```

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
