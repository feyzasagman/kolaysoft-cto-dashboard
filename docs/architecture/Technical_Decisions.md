# Teknik Kararlar

Kolaysoft CTO Dashboard — Full Stack MVP  
Kaynak özet: staj süreci + güncel mimari. Erken PDF notları (`docs/analysis/Day4_Technical_Decision_and_Learning_Plan.pdf`) ile çelişen güncel kararlar burada geçerlidir.

Her madde: **Decision** · **Reason** · **Trade-off**

---

## Spring Boot + React

| | |
|--|--|
| **Decision** | Backend: Spring Boot 3 / Java 21 REST API. Frontend: React 18 + TypeScript + Vite + MUI. |
| **Reason** | Staj stack’i; enterprise güvenlik/JPA ekosistemi; FE’de bileşen ve tip güvenliği. |
| **Trade-off** | İki runtime (JVM + Node); monorepo koordinasyonu gerekir. |

---

## PostgreSQL

| | |
|--|--|
| **Decision** | İlişkisel veri deposu olarak PostgreSQL 16. |
| **Reason** | Kullanıcı/proje/rapor ilişkileri, transaction, staj ortamında yaygın. |
| **Trade-off** | Yerel kurulum veya Docker gerekir; NoSQL esnekliği yok. |

---

## JWT

| | |
|--|--|
| **Decision** | Stateless Bearer JWT (JJWT); `dev`’de seed admin. |
| **Reason** | SPA + API ayrımı; oturum sunucusu yok. |
| **Trade-off** | Refresh token yok; süre bitince yeniden login; secret yönetimi prod’da kritik. |

---

## Flyway

| | |
|--|--|
| **Decision** | Şema Flyway V1; Hibernate `ddl-auto=validate`. |
| **Reason** | Tek kaynaklı migration; ortamlar arası tutarlılık; CI/Compose clean DB. |
| **Trade-off** | Legacy `update` DB’lerde baseline gerekir; şema değişikliği versiyonlu migration ister. |

---

## Role-based architecture

| | |
|--|--|
| **Decision** | `ADMIN` / `PROJECT_MANAGER` / `CTO` — UI + Spring Security method/route yetkisi. |
| **Reason** | Yönetmelik rolleri; UI gizleme tek başına yetmez. |
| **Trade-off** | FE/BE kurallarının senkron tutulması; PM listesi için ayrı API eksikliği FE cache ile kapatıldı. |

---

## REST API

| | |
|--|--|
| **Decision** | `/api/v1` JSON REST; OpenAPI/Swagger. |
| **Reason** | Basit sözleşmeler; Swagger ile keşif; FE Axios. |
| **Trade-off** | Real-time (WebSocket) yok; sayfalama/filtre API yüzeyinde büyür. |

---

## Docker Compose

| | |
|--|--|
| **Decision** | `postgres` + `backend` + `frontend` tek compose; health-gated start. |
| **Reason** | Tek komut Full Stack; CI/demo ile aynı sıra (DB → migration → API → UI). |
| **Trade-off** | Host `5432`/`8080` çakışması; volume bilinçli silinmeli (`down -v`). |

---

## nginx reverse proxy

| | |
|--|--|
| **Decision** | Docker FE: nginx SPA + `/api` → `backend:8080`; build `VITE_API_BASE_URL=/api/v1`. |
| **Reason** | Browser same-origin; Docker hostname’i istemciye sızmaz; CORS yolu basitleşir. |
| **Trade-off** | Local Vite hâlâ cross-origin + CORS allowlist (`localhost:5173`) ister. |

---

## Playwright

| | |
|--|--|
| **Decision** | Kritik akışlar için browser E2E (auth, admin, PM, CTO). |
| **Reason** | Full Stack regression; CI gate. |
| **Trade-off** | DB + backend gerekir; cleanup yok; flaky riski selector disiplinine bağlı. |

---

## GitHub Actions

| | |
|--|--|
| **Decision** | `ci.yml`: Backend Quality → Frontend Quality → Full Stack E2E. |
| **Reason** | `main`’e bozuk push’u erken yakalar; artifact ile debug. |
| **Trade-off** | Runner süresi; E2E secret/env yönetimi; local Docker ile aynı ama ayrı orchestration. |

---

## Deterministic Executive Insight

| | |
|--|--|
| **Decision** | Executive Insight / Attention Center: mevcut alanlardan kural tabanlı UI hesapları; AI/LLM yok. |
| **Reason** | MVP’de deterministik, test edilebilir, ek maliyet/API yok. |
| **Trade-off** | “Zeki” anlatım sınırlı; portföy sayfası/filtre bağlamına bağımlı. |
