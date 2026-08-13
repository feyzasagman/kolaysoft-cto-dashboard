# Test Coverage Strategy

## 1. Amaç

Backend (JaCoCo) ve frontend (Vitest V8) test coverage’ını **gerçek ölçümle** görünür kılmak. Coverage, CI ve lokal kalite görünürlüğünün parçasıdır; ürün davranışını değiştirmez.

## 2. Coverage neyi ölçer / neyi garanti etmez

Ölçer:

- Hangi satır / branch’lerin test sırasında yürütüldüğü
- Suite’in hangi üretim koduna değdiği

Garanti etmez:

- Bug yokluğu
- Doğru iş kuralları
- Güvenlik veya performans

**Yüksek coverage ≠ bug yok.** Coverage, boşlukları görmek için bir haritadır; E2E ve review ile birlikte okunmalıdır.

## 3. Backend JaCoCo yaklaşımı

- Plugin: `org.jacoco:jacoco-maven-plugin` **0.8.15**
- `prepare-agent` → test execution
- `report` → `verify` phase
- Rapor: `backend/cto-dashboard-api/target/site/jacoco/index.html`
- Threshold: **yok** (ilk ölçüm; line ~%34 — erken zorunlu kapı yanıltıcı olur)

## 4. Frontend Vitest V8 yaklaşımı

- Provider: `@vitest/coverage-v8`
- Komut: `npm run test:coverage` (unit PASS + rapor)
- Rapor: `frontend/coverage/index.html` (+ `coverage-summary.json`)
- Threshold: **yok** (tüm `src` ölçülünce line ~%10 — gate sonraki excellence adımında değerlendirilir)

## 5. Include / exclude kuralları

### Backend

- Exclude: **yok** (bootstrap / DTO’ları yapay yükseltmek için çıkarmadık)

### Frontend

Include: `src/**/*.{ts,tsx}`

Exclude:

- `*.test.*` / `*.spec.*`
- `src/test/**`
- `src/main.tsx`
- `src/vite-env.d.ts` / `*.d.ts`
- `.gitkeep`

Utility / kritik component’ler exclude edilmez.

## 6. Lokal komutlar

```powershell
# Backend
cd backend/cto-dashboard-api
./mvnw.cmd clean verify
# → target/site/jacoco/index.html

# Frontend
cd frontend
npm run test:coverage
# → coverage/index.html
```

## 7. CI entegrasyonu

`.github/workflows/ci.yml`

| Job | Coverage |
| --- | --- |
| Backend Quality | `./mvnw -B clean verify` |
| Frontend Quality | `npm run test:coverage` (lint sonrası; `test:run` ile çift koşu yok) |

Artifact (7 gün):

- `backend-jacoco-report`
- `frontend-coverage-report`

## 8. Rapor konumları

| Katman | Path | Git |
| --- | --- | --- |
| Backend HTML | `backend/cto-dashboard-api/target/site/jacoco/` | ignore (`target/`) |
| Frontend HTML | `frontend/coverage/` | ignore (`/coverage/`) |

## 9. Gerçek coverage sonuçları (lokal, doğrulanmış)

Tarih bağlamı: Day 19 excellence 4/8 — lokal ölçüm.

### Backend (JaCoCo, 79 tests PASS)

| Metrik | Değer |
| --- | --- |
| Instructions | **37.2%** (2602/7004) |
| Branches | **19.9%** (84/422) |
| Lines | **33.9%** (486/1434) |
| Methods | **42.6%** (152/357) |
| Classes | **67.0%** (65/97) |

### Frontend (Vitest V8, 42 tests PASS)

| Metrik | Değer |
| --- | --- |
| Statements | **10.1%** |
| Branches | **7.6%** |
| Functions | **5.2%** |
| Lines | **9.9%** |

Kritik FE logic (aynı koşu):

| Dosya | Lines |
| --- | --- |
| `executiveInsight.ts` | ~91.7% |
| `errorUtils.ts` | ~96.8% |
| `labels.ts` | ~84.2% |
| `ExecutiveProjectInsight.tsx` | 100% |
| `PortfolioAttentionCenter.tsx` | 100% |

## 10. Threshold kararı

Bu adımda **CI fail threshold yok**.

Gerekçe: genel line oranları henüz anlamlı bir güvenlik ağı için düşük; sahte düşük threshold veya class exclude ile yükseltme yapılmadı. Sonraki adımda kritik paketlere test eklenip threshold yeniden değerlendirilir.

## 11. Limitations

- Coverage HTML commit edilmez
- Dinamik coverage badge yok (dış publish servisi yok)
- README’deki % değerleri **lokal snapshot**tır; her push otomatik badge güncellemez
- Frontend overall % düşük çünkü pages/hooks/api henüz unit suite’te değil

## 12. Future improvements

1. `ProjectAssignmentServiceImpl` service unit testleri  
2. Diğer `service.impl` boşlukları  
3. `JwtAuthenticationFilter` / security edge path  
4. Frontend: `dashboardMapper` / filter mappers  
5. Frontend: kritik form validation component testleri  
6. Makul package-level threshold (yalnız gerçek oranlar izin verdiğinde)
