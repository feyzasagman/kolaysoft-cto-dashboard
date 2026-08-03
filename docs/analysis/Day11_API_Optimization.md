# Kolaysoft CTO Dashboard

## 11. Gün API Optimizasyonu Dokümanı

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu — API Optimization |
| Tarih | 27 Temmuz 2026 |
| Sürüm | 1.0 |
| Durum | Day 11 tamamlandı |
| Kapsam dışı | Frontend, AI, bildirimler |

---

## 1. Günün amacı

Liste API’lerini üretim kalitesine taşımak: global sayfalama, sıralama, arama, gelişmiş filtreleme, dashboard/repository optimizasyonu, standart hata yanıtı, logging ve Swagger iyileştirmeleri.

---

## 2. Ortak listeleme sözleşmesi

Liste endpointleri artık `ApiResponse<PageResponse<T>>` döner.

| Parametre | Varsayılan | Açıklama |
|---|---|---|
| `page` | `0` | 0 tabanlı sayfa |
| `size` | `20` | 1–100 |
| `sort` | kaynağa göre | `alan,asc\|desc` (allow-list) |
| `search` | — | Metin araması (normalize + LIKE) |

`PageResponse` alanları: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`.

Sıralama `PageableUtils` ile üretilir; izin verilmeyen alan → `400 BUSINESS_RULE`.

---

## 3. Modül bazlı filtreler

| Kaynak | Filtreler |
|---|---|
| Users | `search`, `role`, `active` |
| Projects | `search`, `status`, `managerId` |
| Reports | `search`, `projectId`, `year`, `weekNumber` |
| Work Items | `search`, `reportId`, `status` |
| Risks | `search`, `reportId`, `riskLevel`, `status` |
| Dashboard projects | Day 10 filtreleri + pagination |

PROJECT_MANAGER listelerinde erişim alanı Specification ile SQL’e itilir (manager scope).

---

## 4. Repository / sorgu optimizasyonu

1. **Specification + Page** ile filtre/sayfa DB’de uygulanır.
2. Sayfa ID’leri alındıktan sonra `JOIN FETCH` ile ilişkiler yüklenir (`findByIdInWith*`) — Hibernate `fetch + pagination` uyarısından kaçınılır.
3. Dashboard `latest-reports`: `projectStatus` SQL’e taşındı; health filtresi yoksa `limit*3` over-fetch kaldırıldı (yalnız health varken `limit*2`).
4. Dashboard projects: basit filtrelerde DB pagination; türetilmiş health/risk filtrelerinde in-memory (zorunlu).

---

## 5. Standart hata yanıtı

```json
{
  "success": false,
  "message": "Doğrulama hatası.",
  "data": {
    "code": "VALIDATION_ERROR",
    "path": "/api/v1/users",
    "timestamp": "2026-07-27T10:00:00Z",
    "fields": { "email": "..." }
  }
}
```

Kod örnekleri: `NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE`, `FORBIDDEN`, `UNAUTHORIZED`, `VALIDATION_ERROR`, `TYPE_MISMATCH`, `MISSING_PARAMETER`, `MALFORMED_REQUEST`, `INTERNAL_ERROR`.

---

## 6. Logging

- `CorrelationIdFilter`: `X-Request-Id` header + MDC `requestId`
- `RequestLoggingFilter`: `method`, `path`, `status`, `durationMs` (şifre/token yazılmaz)
- Log pattern: `%X{requestId}` (dev/prod)

---

## 7. Swagger

- OpenAPI version `v1.1`
- Açıklamada pagination + error format
- Bearer JWT Authorize akışı aynı

---

## 8. Testler

MockMvc güncellemeleri:

- Liste yanıtları `$.data.content[...]`
- Validation hatalarında `$.data.code`
- Pagination/search parametre smoke testleri
- `PageableUtilsTest`

---

## 9. Doğrulama

```bash
./mvnw clean package
```

Swagger UI: `/swagger-ui.html` (Authorize sonrası liste endpointlerinde `page/size/sort/search`).

---

## 10. Breaking change notu

Frontend henüz yok; liste DTO’su `List` → `PageResponse` değişimi bilinçli kırıcı değişikliktir.

---

## 11. Önerilen commit

```text
feat: optimize API performance and filtering
```
