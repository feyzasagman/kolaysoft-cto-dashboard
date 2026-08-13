# ADR-002: Flyway Schema Management with Hibernate Validate

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Backend / Infrastructure / Data

## Context

Kullanıcı, proje, rapor, risk ve assignment verisi ilişkisel şemaya bağlıdır. Geliştirme, Docker Compose ve CI’daki temiz Postgres arasında şemanın **deterministik** oluşması gerekir. Hibernate’in runtime’da şemayı “update” etmesi ortamlar arası drift ve CI’da öngörülemezlik riski taşır.

## Decision

Şema yaşam döngüsü **Flyway versioned migrations** ile yönetilir; Hibernate **`ddl-auto=validate`** kullanır.

- İlk migration: `V1__init_schema.sql`
- Uygulama ayağa kalkarken Flyway migration uygular; Hibernate mevcut şemayı validate eder
- CI Full Stack E2E boş Postgres ile aynı yolu kullanır

Legacy / önceden `ddl-auto=update` ile dolmuş veritabanlarında otomatik “sil-yeniden-yaz” yoktur; baseline / bilinçli reset (`docker compose down -v` vb.) dokümante edilir.

## Alternatives Considered

- **`ddl-auto=update`:** Hızlı lokal prototip; migration history yok, CI/prod için güvenilmez.
- **Manual SQL only:** Disiplin gerektirir; uygulama startup ile bağlanmaz.
- **Liquibase:** Benzer amaç; ek tooling/öğrenme maliyeti; Flyway staj stack’inde yeterli.

## Rationale

Flyway, şemayı versiyonlu ve tekrarlanabilir yapar. `validate`, entity model ile DB’nin sessizce ayrışmasını engeller. Clean DB (Docker volume / CI service) ile “migration → API → E2E” zinciri tutarlı kalır.

## Consequences

### Positive

- Ortamlar arası aynı şema başlangıcı
- CI’da boş DB’den Flyway history doğrulanabilir
- Şema değişiklikleri review edilebilir migration dosyalarıdır

### Negative / Trade-offs

- Her şema değişikliği **explicit migration** ister; “entity değişti, DB kendiliğinden uydu” yok.
- Eski lokal DB’ler ile yeni V1 history çakışabilir → baseline veya volume reset gerekir.
- Büyük veri migration’ları (backfill) ayrı plan ister; V1 bootstrap odaklıdır.

## Implementation Evidence

- [`../../../backend/cto-dashboard-api/src/main/resources/db/migration/V1__init_schema.sql`](../../../backend/cto-dashboard-api/src/main/resources/db/migration/V1__init_schema.sql)
- [`../../../backend/cto-dashboard-api/src/main/resources/application.yml`](../../../backend/cto-dashboard-api/src/main/resources/application.yml) (`ddl-auto: validate`, `spring.flyway`)
- [`../../../backend/cto-dashboard-api/src/main/resources/application-dev.yml`](../../../backend/cto-dashboard-api/src/main/resources/application-dev.yml)
- [`../../analysis/Day14_Flyway_Migration_Setup.md`](../../analysis/Day14_Flyway_Migration_Setup.md)

## Revisit When

- Multi-tenant veya sharding şema ihtiyacı doğarsa
- Liquibase/org-standard migration aracı zorunlu olursa
- Production blue/green migrate stratejisi (expand/contract) gerekir hale gelirse
