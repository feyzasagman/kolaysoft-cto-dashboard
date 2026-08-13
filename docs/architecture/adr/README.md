# Architecture Decision Records (ADR)

Bu klasör, Kolaysoft CTO Dashboard’da **gerçekten uygulanmış** mimari kararların kalıcı kayıtlarını tutar.

High-level özet için: [`../Technical_Decisions.md`](../Technical_Decisions.md).

## ADR nedir?

Architecture Decision Record; bir teknik kararın bağlamını, seçilen çözümü, değerlendirilen alternatifleri ve trade-off’larını kısa ve savunulabilir biçimde belgeler. Amaç “neden bunu seçtik?” sorusuna koddan bağımsız cevap vermektir.

## Bu projede neden kullanılıyor?

MVP’de stack, güvenlik modeli, şema yönetimi, Docker ağı ve kalite kapısı gibi seçimler kodda sabittir. ADR’ler staj / portföy / mülakat bağlamında bu seçimleri **uydurma pazarlama olmadan** açıklar.

## Index

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-001](ADR-001-jwt-rbac.md) | JWT authentication + backend RBAC | Accepted |
| [ADR-002](ADR-002-flyway-schema-management.md) | Flyway migrations + `ddl-auto=validate` | Accepted |
| [ADR-003](ADR-003-docker-nginx-same-origin-proxy.md) | Docker nginx same-origin `/api` proxy | Accepted |
| [ADR-004](ADR-004-deterministic-executive-insights.md) | Rule-based executive insights (no LLM) | Accepted |
| [ADR-005](ADR-005-layered-backend-architecture.md) | Layered Spring backend (Controller→Entity) | Accepted |
| [ADR-006](ADR-006-testing-quality-gate-strategy.md) | Layered automated quality gate | Accepted |
| [ADR-007](ADR-007-safe-actuator-observability.md) | Safe Actuator health/info exposure | Accepted |

## Numaralama (immutable)

- ADR numaraları **değiştirilmez**.
- Karar değişirse eski dosya silinmez: `Status: Superseded` yapılır ve yeni ADR’ye referans verilir.
- Yeni karar: sıradaki numarayı al (`ADR-008-...`), bu index’e satır ekle, gerekirse `Technical_Decisions.md` / ana README doküman index’ini güncelle.

## Yeni ADR ekleme

1. Kararın kodda gerçekten uygulandığını doğrula.  
2. Bu klasördeki formatı kopyala (`Context` … `Revisit When`).  
3. En az bir gerçek **negative trade-off** yaz.  
4. Implementation Evidence’ta çalışan relative path kullan.  
5. Index tablosuna satır ekle.
