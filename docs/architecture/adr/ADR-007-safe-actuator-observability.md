# ADR-007: Safe Spring Boot Actuator Observability

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Backend / Infrastructure / Operations

## Context

Docker Compose, CI ve gelecekteki orchestration ortamları process **liveness** ve trafik **readiness** sinyallerine ihtiyaç duyar. Aynı zamanda Actuator’ün `env`, `beans`, `heapdump` gibi endpoint’leri secret ve iç yapı sızıntısı riski taşır. Mevcut custom `GET /api/v1/health` uygulama durumu için korunmalıdır.

## Decision

Spring Boot Actuator eklendi; HTTP exposure **minimum**:

- `management.endpoints.web.exposure.include=health,info`
- Health details: `never`
- Probes: enabled (`/actuator/health/liveness`, `/actuator/health/readiness`)
- Security: explicit `permitAll` yalnız health (+ probes) ve info
- Custom `/api/v1/health` korundu
- Docker/CI readiness poll Actuator readiness kullanır
- Prometheus registry / public metrics **yok**

## Alternatives Considered

- **Custom health only:** Mevcut `/api/v1/health` yeterli gibi görünür; orchestration probe semantiği (liveness vs readiness) zayıf kalır.
- **Full Actuator exposure (`*`):** Operasyonel görünürlük artar; güvenlik yüzeyi kabul edilemez.
- **External monitoring agent only:** MVP lokal/Docker demoda ek ajan maliyeti; temel probe ihtiyacını karşılamaz.

## Rationale

Built-in probes, container healthcheck ve CI “ready” poll için doğru semantik sağlar. Exposure whitelist + `show-details=never` + dar security matcher, observability’yi güvenlikle dengeler. Custom application health API contract’ı kırılmaz.

## Consequences

### Positive

- Readiness/liveness Docker ve CI ile hizalı
- Hassas management endpoint’ler HTTP’de yok (404)
- Minimal `info` metadata güvenli

### Negative / Trade-offs

- Metrics/alerting/tracing yok → operasyonel derinlik sınırlı
- Health details kapalı → anonim debug bilgisi az (bilinçli trade-off)
- Custom + Actuator iki health yüzeyi → dokümantasyonda ayrım gerekir

## Implementation Evidence

- [`../../../backend/cto-dashboard-api/pom.xml`](../../../backend/cto-dashboard-api/pom.xml) (`spring-boot-starter-actuator`)
- [`../../../backend/cto-dashboard-api/src/main/resources/application.yml`](../../../backend/cto-dashboard-api/src/main/resources/application.yml)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/SecurityConfig.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/SecurityConfig.java)
- [`../../../backend/cto-dashboard-api/src/test/java/com/kolaysoft/ctodashboard/actuator/ActuatorSecurityTest.java`](../../../backend/cto-dashboard-api/src/test/java/com/kolaysoft/ctodashboard/actuator/ActuatorSecurityTest.java)
- [`../../../backend/cto-dashboard-api/Dockerfile`](../../../backend/cto-dashboard-api/Dockerfile)
- [`../../operations/Observability_and_Health_Strategy.md`](../../operations/Observability_and_Health_Strategy.md)

## Revisit When

- Authenticated metrics / Prometheus scrape gerekir hale gelirse
- Cloud probe path’leri (Kubernetes) farklı base path isterse
- Centralized APM/tracing ürün standardı seçilirse
