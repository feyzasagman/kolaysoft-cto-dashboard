# ADR-003: Docker nginx Same-Origin API Proxy

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Infrastructure / Frontend / Backend

## Context

Docker Compose’ta frontend, backend ve Postgres ayrı container’lardır. Tarayıcı **container hostname** (`backend`) çözemez; API çağrıları host’a göre planlanmalıdır. Frontend’in build-time `VITE_API_BASE_URL` ile doğrudan `http://localhost:8080` işaret etmesi CORS ve ortam farklarını artırır. Demo/repro için tek origin üzerinden SPA + API sunumu tercih edildi.

## Decision

Docker frontend image’ında **nginx**:

- `http://localhost:3000/` → static SPA
- `http://localhost:3000/api/...` → `proxy_pass` → `http://backend:8080/api/...`

Build arg: `VITE_API_BASE_URL=/api/v1` (same-origin relative path).

Compose network’te service discovery (`backend`) nginx tarafında kullanılır; browser yalnızca `:3000` görür.

Local Vite (`:5173`) ayrı kalır: FE → `http://localhost:8080/api/v1`, CORS allowlist’te `:5173`. Day 19’da Docker SPA Origin `http://localhost:3000` Spring’e iletildiği için allowlist’e `:3000` eklendi; same-origin proxy CORS ihtiyacını sıfırlamaz (Origin hâlâ gönderilir).

## Alternatives Considered

- **Browser → doğrudan `:8080`:** Basit; CORS ve mixed-origin her ortamda ayrı yönetilir.
- **Ayrı public API domain:** Prod-benzeri; MVP lokal demoda DNS/TLS maliyeti gereksiz.
- **Vite dev server’ı production serving:** Dev tooling’i image’a taşımak operasyonel olarak uygun değil.

## Rationale

Same-origin `/api` path, SPA’nın API base URL’ini ortama göre hard-code etmeden Docker demo’yu basitleştirir. nginx, Compose içindeki backend hostname’ini bilir; browser bilmek zorunda değildir. Local Vite ile Docker yolları bilinçli olarak ayrılır.

## Consequences

### Positive

- Browser’da container DNS bağımlılığı yok
- Docker demoda API path tutarlı (`/api/v1`)
- Full Stack tek compose komutuyla ayağa kalkar

### Negative / Trade-offs

- nginx config ek operasyonel katmandır (SPA fallback + proxy headers).
- Vite (`:5173`) ve Docker (`:3000`) origin’leri Spring CORS allowlist’te **ayrı** tutulmalıdır; `*` açılmaz.
- Proxy hataları (upstream down) SPA’da network hatası olarak görünür; debug için backend log + health gerekir.

## Implementation Evidence

- [`../../../frontend/nginx.conf`](../../../frontend/nginx.conf)
- [`../../../frontend/Dockerfile`](../../../frontend/Dockerfile) (`VITE_API_BASE_URL=/api/v1`)
- [`../../../docker-compose.yml`](../../../docker-compose.yml)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/CorsConfig.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/CorsConfig.java)
- [`../../deployment/Docker_Compose_Local_Setup.md`](../../deployment/Docker_Compose_Local_Setup.md)

## Revisit When

- Cloud deploy’da API ayrı domain / TLS termination standartlaşırsa
- Cookie-based auth’a geçilirse (same-site / CSRF politikası)
- API gateway (Traefik, Kong) compose yerine geçerse
