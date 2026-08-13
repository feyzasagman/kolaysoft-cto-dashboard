# Observability & Health Strategy

## Amaç

Kolaysoft CTO Dashboard API için **basic observability foundation**: güvenli Spring Boot Actuator health/liveness/readiness/info. Bu doküman Prometheus/Grafana, merkezi log veya alerting kurulumu **değildir**.

## Application Health

`GET /api/v1/health`

- Custom, backward-compatible application status
- Public (`permitAll`)
- Yanıt: `status=UP` + application name (API envelope)

Korunur; Actuator ile değiştirilmez.

## Actuator Health

`GET /actuator/health`

- Operations / orchestration health aggregate
- Public
- `management.endpoint.health.show-details=never` — anonim kullanıcıya DB/component detayı yok

## Liveness

`GET /actuator/health/liveness`

- Process canlı mı?
- Spring Boot built-in probe (`management.endpoint.health.probes.enabled=true`)

## Readiness

`GET /actuator/health/readiness`

- Trafik almaya hazır mı?
- Docker Compose / image `HEALTHCHECK` bu endpoint’i kullanır
- CI backend poll (GitHub Actions) readiness’e bakar

## Info

`GET /actuator/info`

- Minimum metadata: `info.app.name`, `description`, `version`
- `management.info.env.enabled=true` yalnızca Environment’taki `info.*` anahtarlarını katkı eder
- Secret / JDBC / JWT yok (`info.*` altında tutulmaz)

## Security / Exposure Policy

`management.endpoints.web.exposure.include=health,info`

| Public (HTTP) | Not exposed |
| --- | --- |
| `health` (+ `/liveness`, `/readiness`) | `env` |
| `info` | `beans` |
| | `configprops` |
| | `mappings` |
| | `metrics` |
| | `heapdump` |
| | `threaddump` |
| | `loggers` |
| | … |

SecurityConfig **yalnız** şu matcher’lara `permitAll` verir:

- `/actuator/health`
- `/actuator/health/**`
- `/actuator/info`

`/actuator/**` için blanket `permitAll` **yok**.

## Docker Healthcheck

- Image + Compose: `wget` → `http://127.0.0.1:8080/actuator/health/readiness`
- Frontend `depends_on: backend: service_healthy` korunur
- nginx Actuator’ü proxy etmez (gerek yok)

## CI Readiness

`.github/workflows/ci.yml` Full Stack E2E job’u backend ayağa kalkınca:

`curl -sf http://localhost:8080/actuator/health/readiness`

## Logging Safety

- JWT / password / Authorization header loglanmamalı (mevcut filter/service audit: secret body log yok)
- `GlobalExceptionHandler` kullanıcıya stack trace sızdırmaz
- Dev profile SQL debug açık olabilir; prod SQL WARN
- Correlation/request id: log pattern `%X{requestId}` — merkezi tracing değildir

## Current Limitations

- No centralized logging (ELK/CloudWatch vb.)
- No Prometheus / Grafana
- No alerting / on-call
- No distributed tracing (OpenTelemetry)
- No public `/actuator/metrics`
- Request correlation is log-MDC oriented, not a full tracing product

## Future Improvements

- Optional authenticated metrics for operators
- Structured JSON logging in prod
- Correlation ID filter end-to-end documentation
- External uptime checks against readiness
- Alerting on readiness failures in cloud deploy
