# Frontend Unit / Component Test Strategy

## 1. Amaç

Frontend saf logic (mapping, labels, error mesajları, executive insight) ve kritik component render/interaction sözleşmelerini Playwright E2E’den bağımsız, hızlı ve deterministik doğrulamak.

## 2. Neden Vitest + RTL

- Mevcut **Vite 6** toolchain ile aynı runner/config modeli
- React 18 ile uyumlu **React Testing Library** (kullanıcı odaklı sorgular)
- jsdom ile hafif DOM; Jest/Enzyme eklenmez

## 3. Unit vs E2E ayrımı

| Katman | Araç | Odak |
| --- | --- | --- |
| Unit / component | Vitest + RTL | Pure functions, labels, error copy, conditional UI, insight |
| E2E | Playwright | Auth → ADMIN → PM → CTO gerçek browser + API |

E2E senaryolarını unit testte tekrar etmeyiz. Backend contract’ını unit’te yeniden kurmayız.

## 4. Test edilen katmanlar

- `src/utils/executiveInsight.ts` — severity, signals, attention score/sort
- `src/utils/labels.ts` — rol / status / health / risk etiketleri
- `src/utils/errorUtils.ts` — kullanıcıya gösterilen hata mesajları
- `StatusBadges` — görünür text / aria
- `ExecutiveProjectInsight` — render contract
- `PortfolioAttentionCenter` — liste, empty state, navigation click

## 5. Selector yaklaşımı

Öncelik: `getByRole` → `getByLabelText` → `getByText`.  
`data-testid` yalnız gerektiğinde. Hex/color style assertion yazılmaz.

## 6. Mock yaklaşımı

- Pure function testlerinde mock yok
- Router: minimal `MemoryRouter` / `useNavigate` mock (interaction)
- Global axios/fetch mock ve “bütün app” mock yok

## 7. Çalıştırma komutları

```powershell
cd frontend
npm run test          # watch
npm run test:run      # CI / tek koşu
npm run test:coverage # v8 coverage (threshold zorunlu değil)
```

Config: `vitest.config.ts` · setup: `src/test/setup.ts`

## 8. Coverage yaklaşımı

`@vitest/coverage-v8` ile ölçüm yapılır (`npm run test:coverage`).  
**Coverage threshold zorlanmaz** — genel oranlar ve rapor yolları: [`Test_Coverage_Strategy.md`](Test_Coverage_Strategy.md).

## 9. CI entegrasyonu

`.github/workflows/ci.yml` → **Frontend Quality**:

1. `npm ci`
2. `npm run lint`
3. `npm run test:coverage`
4. Upload `frontend-coverage-report`
5. `npm run build`

Playwright job’u ayrı kalır; capture script suite’i etkilenmez.

## 10. Sınırlamalar

- Sayfa düzeyinde API integration / MSW kapsamı yok
- Görsel regression (screenshot diff) unit suite’te yok
- Coverage gate henüz CI fail kriteri değil
