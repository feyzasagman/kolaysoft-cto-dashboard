# Kolaysoft CTO Dashboard

## 6. Gün Veritabanı Entegrasyonu Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Veritabanı Entegrasyonu ve JPA Model Raporu |
| Tarih | 27 Temmuz 2026 |
| Sürüm | 1.0 |
| Durum | Day 6 tamamlandı; JWT/Auth/CRUD henüz başlatılmadı |

---

## 1. Amaç

Bu doküman, 6. gün kapsamında tamamlanan PostgreSQL bağlantısı, JPA entity modeli, repository katmanı,
Hibernate yapılandırması ve şema oluşturma çalışmalarını açıklar.

Kapsam dışı bırakılanlar:

- JWT kimlik doğrulama
- Authentication / Authorization iş mantığı
- CRUD API endpointleri
- Frontend geliştirme

---

## 2. Veritabanı Yapılandırması

### 2.1 Profil Dosyaları

| Dosya | Amaç |
|---|---|
| `application.yml` | Ortak ayarlar, zorunlu ortam değişkenleri, güvenli varsayılan `ddl-auto: validate` |
| `application-dev.yml` | Geliştirme varsayılanları, `ddl-auto: update`, SQL loglama |
| `application-prod.yml` | Üretim bağlantısı, `ddl-auto: validate`, Swagger varsayılan kapalı |

### 2.2 Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `DB_URL` | JDBC bağlantı adresi |
| `DB_USERNAME` | Veritabanı kullanıcı adı |
| `DB_PASSWORD` | Veritabanı parolası |
| `SPRING_PROFILES_ACTIVE` | Aktif profil (`dev` / `prod`) |
| `SERVER_PORT` | Opsiyonel; varsayılan `8080` |

Gerçek şifreler repository'ye yazılmamıştır.

### 2.3 Hibernate Kararları

- `open-in-view: false`
- Dialect: `PostgreSQLDialect`
- JDBC zaman dilimi: `UTC`
- Dev: `ddl-auto=update` ile entity'lerden otomatik şema üretimi
- Prod: `ddl-auto=validate`
- Enum alanları `STRING` olarak saklanır

---

## 3. Entity Modeli

Day 6 görevi doğrultusunda Day 2 ER / Class diyagramındaki varlık isimleri esas alınmıştır.

### 3.1 Tablolar

| Entity | Tablo | Açıklama |
|---|---|---|
| `Role` | `roles` | Sistem rolleri |
| `User` | `users` | Kullanıcılar |
| `Project` | `projects` | Projeler |
| `ProjectAssignment` | `project_assignments` | Kullanıcı-proje ataması |
| `WeeklyReport` | `weekly_reports` | Haftalık raporlar |
| `WorkItem` | `work_items` | İş kalemleri |
| `RiskIssue` | `risk_issues` | Risk / engel kayıtları |

### 3.2 İlişkiler

- `Role` 1 — N `User`
- `User` N — M `Project` (`ProjectAssignment` üzerinden)
- `Project` 1 — N `WeeklyReport`
- `WeeklyReport` 1 — N `WorkItem`
- `WeeklyReport` 1 — N `RiskIssue`

### 3.3 Önemli Kısıtlar

- `users.email` unique
- `roles.name` unique
- `project_assignments (project_id, user_id)` unique
- `weekly_reports (project_id, year, week_number)` unique

`year` alanı Day 2 diyagramında yoktu; aynı hafta numarası farklı yıllarda çakışmasın diye Day 3 iş kuralına uygun olarak eklenmiştir.

### 3.4 Enumlar

| Enum | Değerler |
|---|---|
| `RoleType` | `ADMIN`, `PROJECT_MANAGER`, `CTO` |
| `ProjectStatus` | `PLANNED`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED` |
| `WorkItemStatus` | `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `RiskStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `ACCEPTED` |

---

## 4. Repository Katmanı

Aşağıdaki Spring Data JPA arayüzleri oluşturulmuştur:

- `RoleRepository`
- `UserRepository`
- `ProjectRepository`
- `ProjectAssignmentRepository`
- `WeeklyReportRepository`
- `WorkItemRepository`
- `RiskIssueRepository`

Bu katmanda yalnızca kalıcılık arayüzleri vardır. Service / Controller CRUD işlemleri Day 6 kapsamında eklenmemiştir.

---

## 5. JPA Tasarım Kararları

1. Entity isimleri Day 6 görevindeki Day 2 modeline göre tutulmuştur (`RiskIssue`, `ProjectAssignment`, ayrı `Role` tablosu).
2. İlişkilerde `FetchType.LAZY` tercih edilmiştir.
3. `@Data` kullanılmamış; `@Getter` / `@Setter` tercih edilmiştir.
4. Parola alanı `passwordHash` olarak tutulmuş; düz metin parola modeli yoktur.
5. Cascade yalnızca `WeeklyReport -> WorkItem/RiskIssue` için tanımlanmıştır.
6. Referans şema `database/schema.sql` dosyasına yazılmıştır.
7. Flyway henüz eklenmemiştir; sonraki günlerde migration yaklaşımına geçilmesi önerilir.

---

## 6. Karşılaşılan Problemler ve Çözümler

### 6.1 Yerel PostgreSQL yoktu

**Problem:** `localhost:5432` kapalıydı; uygulama normal başlangıçta bağlantı kuramıyordu.  
**Çözüm:** Docker Desktop başlatıldı ve `postgres:16-alpine` konteyneri ile `cto_dashboard` veritabanı ayağa kaldırıldı.

### 6.2 Docker daemon kapalıydı

**Problem:** `docker` komutu yüklü olsa da daemon çalışmıyordu.  
**Çözüm:** Docker Desktop başlatıldıktan sonra konteyner oluşturuldu.

### 6.3 Day 2 / Day 3 model farkı

**Problem:** Day 3 analizi sadeleştirilmiş 5 varlık önerirken Day 6 görevi Day 2'deki 7 varlığı istiyordu.  
**Çözüm:** Day 6 görevi uygulandı. `year` unique kısıtı gibi kritik iş kuralı Day 3'ten korunarak `WeeklyReport` içine eklendi.

### 6.4 Java 21 ortamı

**Problem:** Sistem varsayılan Java sürümü 17 olabiliyor.  
**Çözüm:** Doğrulama Temurin JDK 21 ile `JAVA_HOME` set edilerek yapıldı.

---

## 7. Doğrulama Sonuçları

| Kontrol | Sonuç |
|---|---|
| `./mvnw clean test` | BUILD SUCCESS (1 test geçti) |
| PostgreSQL bağlantısı | Başarılı |
| Uygulama başlangıcı (`dev`) | Başarılı |
| Health endpoint | HTTP 200, `status=UP` |
| Oluşturulan tablolar | `roles`, `users`, `projects`, `project_assignments`, `weekly_reports`, `work_items`, `risk_issues` |
| Unique kısıtlar | `uk_project_assignments_project_user`, `uk_weekly_reports_project_year_week` |

---

## 8. Değiştirilen / Oluşturulan Dosyalar

### Yapılandırma

- `backend/cto-dashboard-api/src/main/resources/application.yml`
- `backend/cto-dashboard-api/src/main/resources/application-dev.yml`
- `backend/cto-dashboard-api/src/main/resources/application-prod.yml`

### Enumlar

- `enums/RoleType.java`
- `enums/ProjectStatus.java`
- `enums/WorkItemStatus.java`
- `enums/RiskLevel.java`
- `enums/RiskStatus.java`

### Entity'ler

- `entity/Role.java`
- `entity/User.java`
- `entity/Project.java`
- `entity/ProjectAssignment.java`
- `entity/WeeklyReport.java`
- `entity/WorkItem.java`
- `entity/RiskIssue.java`

### Repository'ler

- `repository/RoleRepository.java`
- `repository/UserRepository.java`
- `repository/ProjectRepository.java`
- `repository/ProjectAssignmentRepository.java`
- `repository/WeeklyReportRepository.java`
- `repository/WorkItemRepository.java`
- `repository/RiskIssueRepository.java`

### Dokümantasyon / Şema

- `database/schema.sql`
- `README.md`
- `docs/analysis/Day6_Database_Integration.md`

---

## 9. Sonraki Gün Planı

Önerilen Day 7 kapsamı:

1. Flyway migration yaklaşımına geçiş (`ddl-auto` yerine kontrollü migration)
2. Seed / başlangıç rol ve admin verisi
3. JWT authentication başlangıcı
4. Login / `/auth/me` endpointleri
5. Rol bazlı güvenlik filtre zinciri

Day 6 sonunda JWT, Authentication ve CRUD iş mantığı henüz başlamamıştır.

---

## 10. Sonuç

Day 6 hedefi tamamlanmıştır. PostgreSQL entegrasyonu, JPA entity modeli, repository katmanı ve otomatik şema üretimi doğrulanmıştır. Uygulama `dev` profilinde veritabanına bağlanıp health endpoint'ini başarıyla sunmaktadır.
