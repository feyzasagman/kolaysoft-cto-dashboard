# ADR-005: Layered Backend Architecture

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Backend

## Context

API yüzeyi kullanıcı, proje, assignment, haftalık rapor, risk, work item ve dashboard endpoint’lerini kapsar. HTTP sözleşmesi, iş kuralları ve persistence’ın aynı sınıfta birleşmesi test etmeyi ve yetki sınırlarını zorlaştırır. Spring Boot ekosisteminde yaygın olan katmanlı yapı tercih edildi.

## Decision

Backend kodu katmanlara ayrılır:

| Layer | Responsibility |
| --- | --- |
| **Controller** | HTTP boundary, `@PreAuthorize`, status codes |
| **DTO** (`dto/request`, `dto/response`) | API contract |
| **Mapper** | Entity ↔ DTO dönüşümü |
| **Service** (+ `service.impl`) | Business rules, orchestration |
| **Repository** | Persistence access |
| **Entity** | JPA model |

Örnek akış: `WeeklyReportController` → `WeeklyReportService` → repository/entity; health hesapları util (`ReportHealthCalculator`) service katmanından kullanılır.

## Alternatives Considered

- **Controller → Repository doğrudan:** Az dosya; iş kuralları HTTP katmanına sızar, test zorlaşır.
- **Active Record tarzı rich entities:** JPA entity’lerde iş kuralı; API contract ile model karışır.
- **Tek “God” service:** Hızlı başlangıç; büyüyen MVP’de bakım maliyeti yüksek.

## Rationale

Katmanlar, MockMvc (controller) ve service unit testlerini ayırmayı kolaylaştırır. DTO, FE ile sözleşmeyi entity şemasından ayırır. Assignment / report gibi kurallar service’te toplanır; controller ince kalır.

## Consequences

### Positive

- Separation of concerns; paket yapısı okunabilir
- Controller ve service testleri bağımsız yazılabilir
- API contract (DTO) ile persistence modelinin evrimi kısmen ayrılır

### Negative / Trade-offs

- Küçük MVP için **daha fazla boilerplate** (mapper + DTO + interface/impl)
- Basit CRUD endpoint’lerinde katmanlar “overkill” görünebilir
- Mapper/DTO drift riski: alan eklenince birden fazla dosya güncellenir

## Implementation Evidence

- Controllers: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/)
- Services: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/service/`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/service/)
- Mappers: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/mapper/`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/mapper/)
- Repositories: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/repository/`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/repository/)
- Entities: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/entity/`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/entity/)
- Example: [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/WeeklyReportController.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/WeeklyReportController.java) → [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/service/impl/WeeklyReportServiceImpl.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/service/impl/WeeklyReportServiceImpl.java)

## Revisit When

- Modular monolith / bounded context ayrımı gerekir hale gelirse
- CQRS veya event-driven yazma modeli benimsenirse
- Ortak “application” katmanı (use-case) ekip standardı olursa
