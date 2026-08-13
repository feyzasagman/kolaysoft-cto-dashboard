# ADR-004: Deterministic Executive Insights (No LLM)

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Frontend / Product Logic

## Context

CTO / ADMIN için Project Detail “Yönetici Özeti” ve Dashboard “Dikkat Gerektiren Projeler” görünümleri gerekir. Özet metin ve öncelik sıralaması **mevcut API alanlarından** (health, progress target/actual, risk counts, report flags, work items) türetilmelidir. MVP’de harici AI API, model maliyeti veya açıklanamayan çıktı kabul edilmedi.

## Decision

Executive Project Insight ve Portfolio Attention Center **kural tabanlı, deterministik** hesaplanır; **LLM/AI kullanılmaz**.

- Pure functions: `buildExecutiveProjectInsight`, `computeAttentionScore`, `buildPortfolioAttentionItems` (`executiveInsight.ts`)
- Sinyaller: hedef farkı, risk durumu, rapor durumu, sağlık (ve özet cümlelerinde work item / gap facts)
- Attention score **UI-only** sıralama; backend’e persist edilmez
- Severity: `ok` | `attention` | `critical` — eşikler kodda sabittir (ör. progress gap ≥ 10)

Bu bir “AI ürün özelliği” değildir; bilinçli **explainable engineering** kararıdır.

## Alternatives Considered

- **LLM-generated executive summary:** Doğal dil zenginliği; hallucination, latency, API key, maliyet, non-determinism.
- **Backend persisted attention score:** Tek kaynak; şema + migration + API contract büyür; MVP UI ihtiyacı için erken.
- **ML risk prediction:** Veri ve model pipeline gerektirir; mevcut staj MVP kapsamı dışı.

## Rationale

Aynı input her zaman aynı headline / signals / sıralamayı üretir → unit test ve E2E ile doğrulanabilir. Harici bağımlılık yok; offline Docker demoda çalışır. Karar gerekçesi mülakatta “neden AI yok?” sorusuna net cevap verir: explainability, reproducibility, scope control.

## Consequences

### Positive

- Deterministik çıktı; Vitest ile yüksek coverage’lı logic testleri mümkün
- Ek latency / vendor lock-in yok
- Kullanıcıya gösterilen “neden” alanları (reason string) kural setinden türetilir

### Negative / Trade-offs

- Kurallar **manuel evolve** edilir; dil modeli kadar esnek anlatım yok
- Attention listesi mevcut dashboard portföy sayfası / filtre bağlamıyla sınırlıdır
- Eşikler (gap, risk ağırlıkları) product tune ister; “öğrenen” sistem değildir

## Implementation Evidence

- [`../../../frontend/src/utils/executiveInsight.ts`](../../../frontend/src/utils/executiveInsight.ts)
- [`../../../frontend/src/components/projects/ExecutiveProjectInsight.tsx`](../../../frontend/src/components/projects/ExecutiveProjectInsight.tsx)
- [`../../../frontend/src/components/dashboard/PortfolioAttentionCenter.tsx`](../../../frontend/src/components/dashboard/PortfolioAttentionCenter.tsx)
- [`../../../frontend/src/utils/executiveInsight.test.ts`](../../../frontend/src/utils/executiveInsight.test.ts)
- Backend health kuralları (rapor sağlığı): [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/util/ReportHealthCalculator.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/util/ReportHealthCalculator.java)

## Revisit When

- Persist edilmiş portföy skorları ürün gereksinimi olursa
- Gerçek NLP özetleri (insan onayıyla) istenirse
- Attention Center tüm portföyü sayfalama bağımsız taramak zorunda kalırsa
