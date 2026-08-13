# ADR-006: Layered Automated Quality Gate

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Quality / CI / Backend / Frontend

## Context

Full Stack MVP’de regresyon riski auth, RBAC, rapor/health kuralları ve rol akışlarında yoğunlaşır. Yalnız manuel test veya yalnız E2E, hızlı feedback ve bakım maliyeti arasında dengesizdir. `main`’e bozuk değişikliklerin erken yakalanması hedeflenir.

## Decision

Katmanlı otomatik kalite kapısı:

| Layer | Tooling |
| --- | --- |
| Backend unit / controller / service | Maven Surefire (`./mvnw clean verify`) |
| Backend coverage (measurement) | JaCoCo (verify phase; threshold zorunlu değil) |
| Frontend lint | ESLint |
| Frontend unit / component | Vitest + React Testing Library |
| Frontend coverage (measurement) | Vitest V8 (`test:coverage`) |
| Production build | `vite build` (+ `tsc`) |
| Full Stack E2E | Playwright (auth → ADMIN → PM → CTO) |
| Orchestration | GitHub Actions `CI Quality Gate` |

CI sırası: **Backend Quality** → **Frontend Quality** → **Full Stack E2E** (temiz Postgres + Flyway). Coverage HTML artifact olarak saklanır; fail threshold bu aşamada zorlanmaz.

Playwright product-tour capture ayrı config’tedir; kalite gate E2E suite’inden bağımsızdır.

## Alternatives Considered

- **Manual-only testing:** Ucuz başlangıç; regression garantisi yok.
- **E2E-only:** Gerçek kullanıcı yolu; yavaş, flaky riski, birim mantığı için maliyetli.
- **Unit-only:** Hızlı; browser + JWT + CORS + compose entegrasyonunu kaçırır.

## Rationale

Test pyramid prensibi: hızlı unit/component ile kural ve mapping; E2E ile kritik rol akışları. CI, `push`/`PR` → `main` üzerinde aynı kapıyı tekrarlar. Coverage görünürlüğü (JaCoCo / V8) boşlukları gösterir; “yüksek % = bug yok” iddiası taşımaz.

## Consequences

### Positive

- Regresyonlar `main` öncesi yakalanır
- Backend 79 + FE unit 42 + E2E 7 ayrı katmanda okunur
- Artifact’ler (Playwright report, coverage HTML) debug’a yardım eder

### Negative / Trade-offs

- CI süresi ve runner maliyeti artar (özellikle E2E + Postgres service)
- Selector / fixture bakımı gerekir; E2E destructive cleanup yok (unique timestamp veri)
- Coverage gate henüz zorunlu değil → düşük overall % sessizce kalabilir; ayrı excellence adımında ele alınır

## Implementation Evidence

- [`../../../.github/workflows/ci.yml`](../../../.github/workflows/ci.yml)
- [`../../testing/CI_Quality_Gate.md`](../../testing/CI_Quality_Gate.md)
- [`../../testing/Automated_E2E_Test_Strategy.md`](../../testing/Automated_E2E_Test_Strategy.md)
- [`../../testing/Frontend_Unit_Test_Strategy.md`](../../testing/Frontend_Unit_Test_Strategy.md)
- [`../../testing/Test_Coverage_Strategy.md`](../../testing/Test_Coverage_Strategy.md)
- [`../../../frontend/playwright.config.ts`](../../../frontend/playwright.config.ts)
- [`../../../frontend/vitest.config.ts`](../../../frontend/vitest.config.ts)
- [`../../../backend/cto-dashboard-api/pom.xml`](../../../backend/cto-dashboard-api/pom.xml) (JaCoCo plugin)

## Revisit When

- Coverage threshold’ları kritik paketler için güvenli hale gelirse
- E2E parallelization / shared auth setup gerekir hale gelirse
- Contract testing (OpenAPI consumer) eklenecekse
