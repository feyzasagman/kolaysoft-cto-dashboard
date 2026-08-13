# ADR-001: JWT Authentication and Backend RBAC

- Status: Accepted
- Date: 2026
- Decision Owners: Project Team / Internship Project
- Scope: Backend / Frontend / Security

## Context

Sistem bir SPA (React) ve ayrı bir REST API (Spring Boot) olarak çalışır. Kullanıcılar `ADMIN`, `PROJECT_MANAGER` ve `CTO` rollerine göre farklı ekran ve işlemler görür. Güvenlik sınırının yalnızca frontend’de gizlenen menülerle çizilmesi yetersizdir; API’nin kimlik doğrulama ve yetkilendirmeyi kendi tarafında zorunlu kılması gerekir. MVP kapsamında harici identity provider (OAuth/OIDC) entegrasyonu hedeflenmedi.

## Decision

Stateless **Bearer JWT** ile kimlik doğrulama ve Spring Security üzerinde **backend-authoritative RBAC** kullanıldı.

- Login sonrası JWT üretilir; istekler `Authorization: Bearer` ile gider.
- Roller: `ADMIN`, `PROJECT_MANAGER`, `CTO` (`RoleType`).
- Method/route koruması `@PreAuthorize` ve security filter zinciri ile uygulanır.
- Frontend rol görünürlüğü UX içindir; yetki kaynağı backend’dir.
- `CTO` / dashboard odaklı okuma; `ADMIN` kullanıcı/proje yönetimi; `PROJECT_MANAGER` atandığı projelerde rapor/work/risk akışı.
- `dev` profilinde seed admin (`DevDataInitializer`) lokal demo içindir.

## Alternatives Considered

- **Server-side session (cookie + HttpSession):** Sticky session / session store gerektirir; SPA + REST ayrımını karmaşıklaştırır.
- **UI-only role control:** Menü gizleme tek başına API’yi korumaz; güvenlik sınırı değildir.
- **OAuth2 / OIDC provider:** Kurumsal SSO için uygun; MVP’ye dış bağımlılık, client kaydı ve callback akışı ekler.

## Rationale

JWT, sunucu tarafında oturum saklamadan SPA’nın REST API’ye bağlanmasını sağlar. Spring Security + `@PreAuthorize`, rol kurallarını controller sınırında zorunlu kılar; frontend’deki `ProtectedRoute` / menü filtreleri yalnızca deneyimi şekillendirir. Üç rol staj gereksinimleriyle hizalıdır ve mevcut endpoint yüzeyine net map edilir.

## Consequences

### Positive

- Stateless API ölçeklemesi ve container ortamında session affinity ihtiyacı yok.
- Yetki kuralları backend testleriyle (MockMvc / security tests) doğrulanabilir.
- CTO read-heavy / ADMIN write / PM assigned-project ayrımı kodda açık.

### Negative / Trade-offs

- **Refresh token yok:** Access token süresi bitince yeniden login gerekir; server-side revocation / token rotation MVP’de yok.
- JWT secret ve süre prod’da dikkatli yönetilmelidir; `dev` seed admin production secret’ı değildir.
- FE ve BE rol sözlüğünün senkron tutulması gerekir.

## Implementation Evidence

- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/security/JwtService.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/security/JwtService.java)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/SecurityConfig.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/SecurityConfig.java)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/enums/RoleType.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/enums/RoleType.java)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/DashboardController.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/controller/DashboardController.java) (`@PreAuthorize`)
- [`../../../frontend/src/routes/ProtectedRoute.tsx`](../../../frontend/src/routes/ProtectedRoute.tsx)
- [`../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/DevDataInitializer.java`](../../../backend/cto-dashboard-api/src/main/java/com/kolaysoft/ctodashboard/config/DevDataInitializer.java)

## Revisit When

- Refresh token / logout denylist gereksinimi oluşursa
- Kurumsal SSO (OIDC) zorunlu hale gelirse
- Rol modeli genişlerse (ör. MEMBER) veya resource-level ACL ihtiyacı artarsa
