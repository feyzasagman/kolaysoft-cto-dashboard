# Day 19 — Deployment ve Doğrulanmış Lokal Demo

## 1. Yönetmelik hedefi

Full Stack MVP’nin gerçekten çalıştırılabildiğini kanıtlamak: PostgreSQL + Spring Boot + React/nginx birlikte; env, CORS, Flyway, seed, health, smoke, log.

## 2. Yapılan çalışma

- Compose config + `up -d --build`
- Health / Swagger / FE / nginx proxy doğrulama
- Flyway + volume + persistence (`down`/`up`, **-v yok**)
- API smoke (ADMIN/PM/CTO) + Playwright Docker UI **7/7**
- CI `main` success kontrolü (GitHub API)
- Dokümantasyon: smoke matrisi, verified demo, bu analiz
- **Bulgu + minimal fix:** Docker Origin `:3000` CORS allowlist

## 3. Neden local Docker demo

Cloud production yerine tek komutla tekrarlanabilir, CI’ya yakın Full Stack kanıtı. Production secrets / monitoring kapsam dışı.

## 4. Doğrulanan servisler

| Servis | Kanıt |
| --- | --- |
| postgres | healthy, schema + volume |
| backend | JAR, Flyway, health, Swagger |
| frontend | nginx SPA :3000, proxy `/api` |

## 5. CORS / env sonucu

Env compose ↔ backend uyumlu (demo).  
CORS: nginx Origin’i ilettiği için `:3000` allowlist zorunlu; eklendi. Vite `:5173` korundu.

## 6. Smoke sonucu

D19-001…D19-020: **20 PASS / 0 FAIL**  
Detay: `docs/testing/Day19_Docker_Smoke_Test_Report.md`

## 7. Log sonucu

Startup temiz (Hikari/Flyway/Tomcat). Smoke sonrası kontrolsüz 500/ERROR yok.

## 8. Persistence sonucu

Volume korundu; restart sonrası ADMIN login + Day19 proje verisi mevcut.

## 9. CI sonucu

`CI Quality Gate` on `main` — son completed run’lar **success**.

## 10. Açık sorunlar

- Production/cloud deploy yok
- Evidence screenshot dosyaları opsiyonel klasörde (otomatik commit yok)
- PM list endpoint by-design kısıtı (bilinen MVP limitation)

## 11. Day20 hazırlığı

Çalışan Docker stack, demo credentials, demo senaryosu (Day18), Day19 smoke, README, CI PASS ve git history hazır. Day20 sunumu bu kanıt setine dayanabilir.
