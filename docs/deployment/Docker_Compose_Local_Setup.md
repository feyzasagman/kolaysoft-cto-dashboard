# Docker Compose — Yerel Full Stack Kurulum

## 1. Amaç

Temiz bir makinede PostgreSQL + Spring Boot + React uygulamasını mümkün olduğunca az adımla ayağa kaldırmak.

Ana komut:

```bash
docker compose --env-file .env.docker.example up --build
```

Bu ortam **DEMO / LOCAL ONLY** içindir. Production secret kullanmayın.

## 2. Gereksinimler

- Docker Desktop (veya Docker Engine + Compose v2)
- Açık portlar: `3000`, `8080`, `5432`

Not: Makinede zaten `cto-dashboard-postgres` veya `:8080` dinleyen bir süreç varsa çakışır; önce durdurun.

## 3. Servis mimarisi

| Servis | Image / build | Network adı | Rol |
|--------|---------------|-------------|-----|
| postgres | `postgres:16-alpine` | `postgres` | DB + volume |
| backend | `backend/cto-dashboard-api/Dockerfile` | `backend` | Spring Boot API |
| frontend | `frontend/Dockerfile` (nginx) | `frontend` | SPA + `/api` proxy |

Browser → `http://localhost:3000` → nginx static  
Browser → `http://localhost:3000/api/...` → nginx → `backend:8080/api/...`

Aynı origin olduğu için Docker UI yolunda ekstra CORS gerekmez.

## 4. Portlar

| Dış URL | Servis |
|---------|--------|
| http://localhost:3000 | Frontend (nginx :80) |
| http://localhost:8080 | Backend API |
| http://localhost:8080/swagger-ui/index.html | Swagger |
| localhost:5432 | PostgreSQL |

## 5. Environment

Örnek dosya: `.env.docker.example` (commit edilir).

| Değişken | Açıklama |
|----------|---------|
| `POSTGRES_DB` / `USER` / `PASSWORD` | Compose DB (demo) |
| `DB_URL` | Compose içinde `jdbc:postgresql://postgres:5432/...` |
| `JWT_SECRET` | Demo JWT imza anahtarı |
| `SPRING_PROFILES_ACTIVE` | Varsayılan `dev` (seed + Flyway) |

Frontend build arg: `VITE_API_BASE_URL=/api/v1` (same-origin).

Gerçek `.env.docker` gitignore’dadır.

## 6. İlk çalıştırma

```bash
# Repo kökünden
docker compose --env-file .env.docker.example up --build
# veya arka planda:
docker compose --env-file .env.docker.example up -d --build
```

İlk build Maven/npm indirmeleri nedeniyle birkaç dakika sürebilir.

Seed ADMIN (`dev` profil):

- E-posta: `admin@kolaysoft.com.tr`
- Şifre: `Admin123!`

## 7. Servis durumları

```bash
docker compose ps
```

Beklenen: postgres **healthy**, backend **healthy**, frontend **running**.

## 8. Log görüntüleme

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## 9. DB persistence

Volume: `postgres_data`

```bash
docker compose down
```

Volume **silinmez**; veriler kalır.

## 10. Full reset

**UYARI:** `-v` PostgreSQL volume’unu siler; tüm DB verisi gider.

```bash
docker compose down -v
docker compose --env-file .env.docker.example up --build
```

Sıfır DB’de Flyway V1 + Hibernate validate + `DevDataInitializer` tekrar çalışır.

Gerçek kullanıcı verisi varsa `-v` kullanmayın.

## 11. Build

```bash
docker compose config
docker compose build
```

## 12. Troubleshooting

| Belirti | Kontrol |
|---------|---------|
| Port in use | Yerel postgres/backend/vite’ı durdurun |
| Backend unhealthy | `docker compose logs backend` — DB/Flyway/JWT |
| Frontend boş / API fail | Network sekmesi: `/api/v1/...` 200 mü? |
| Login fail | `dev` profil + seed şifresi |
| Volume eski şema | Bilinçli reset: `down -v` |

## 13. Security notları

- Compose demo şifreleri production’a taşımayın
- JWT secret demo’dur
- CORS `*` açılmaz; Docker UI same-origin proxy kullanır
- CI ayrı PostgreSQL service ile çalışmaya devam eder (bu Compose CI’yi değiştirmez)

## 14. Smoke test

1. http://localhost:3000 açılır  
2. ADMIN login  
3. Dashboard / Projeler / Detail  
4. http://localhost:8080/api/v1/health → UP  
5. Swagger açılır  
6. Backend logunda Flyway migrate başarılı  

## Kullanışlı komutlar

```bash
docker compose --env-file .env.docker.example up --build
docker compose --env-file .env.docker.example up -d --build
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose down          # volume korunur
docker compose down -v       # volume SİLİNİR — veri kaybı
```
