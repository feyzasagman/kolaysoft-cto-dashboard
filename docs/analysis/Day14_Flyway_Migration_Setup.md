# Kolaysoft CTO Dashboard

## Day 14 — Flyway Migration Kurulumu

| Doküman Bilgisi | Değer |
|---|---|
| Proje | Kolaysoft CTO Dashboard |
| Doküman Türü | Staj Günlük Teknik Raporu |
| Tarih | 6 Ağustos 2026 |
| Sürüm | 1.0 |
| Durum | Flyway altyapısı eklendi |
| Kapsam dışı | Entity/API değişikliği, demo veri silme, Docker volume silme, otomatik baseline |

---

## 1. Amaç

Hibernate `ddl-auto=update` bağımlılığını kaldırıp şemayı Flyway ile versiyonlamak; mevcut veriyi koruyarak güvenli migration altyapısı kurmak.

---

## 2. Analiz

### Entity ↔ `schema.sql`

Tablo ve kolonlar büyük ölçüde uyumlu. `schema.sql` ek ikincil index’ler içerir; entity’lerde `@Index` yoktur.

**Karar:** V1 yalnızca entity modelini esas alır. Entity’de tanımlı olmayan index oluşturulmadı.

### `sample_data.sql`

Dosya boş (0 byte). Demo/admin/proje/rapor seed’i yok → **V2 oluşturulmadı**.

### Mevcut `cto_dashboard`

- 7 iş tablosu mevcut
- `flyway_schema_history` **yok**
- Baseline olmadan V1 çalıştırılırsa `already exists` riski

### DevDataInitializer

`@Profile("dev")` — roller + admin. Migration’a taşınmadı; aynen bırakıldı.

---

## 3. Migration yapısı

```
backend/cto-dashboard-api/src/main/resources/db/migration/
  V1__init_schema.sql
```

Kurallar:

- `CREATE TABLE IF NOT EXISTS` yok
- `DROP` yok
- Enum’lar `VARCHAR` (`EnumType.STRING`)
- Unique constraint isimleri entity ile uyumlu (`uk_project_assignments_project_user`, `uk_weekly_reports_project_year_week`, …)

---

## 4. Entity eşleşmesi

| Entity | Tablo |
|---|---|
| Role | roles |
| User | users |
| Project | projects |
| ProjectAssignment | project_assignments |
| WeeklyReport | weekly_reports |
| WorkItem | work_items |
| RiskIssue | risk_issues |

Identity: `BIGSERIAL` / `GenerationType.IDENTITY`.

---

## 5. Flyway kurulumu

**pom.xml** (sürüm Spring Boot BOM):

- `flyway-core`
- `flyway-database-postgresql`

**Yapılandırma** (`application.yml` + `application-dev.yml`):

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    locations: classpath:db/migration
    validate-on-migrate: true
```

`baseline-on-migrate` **eklenmedi**.

---

## 6. Baseline stratejisi

| Ortam | Yaklaşım |
|---|---|
| Boş DB / `cto_dashboard_flyway_test` | V1 doğrudan uygulanır |
| Dolu eski `cto_dashboard` | Tek seferlik manuel baseline (README) |

Otomatik baseline kodda yok; veri kaybı riski bilinçli olarak dışarıda bırakıldı.

---

## 7. DevDataInitializer

Değiştirilmedi.

- Roller: ADMIN, PROJECT_MANAGER, CTO
- Admin: `admin@kolaysoft.com.tr` (BCrypt)
- Yalnızca `dev` profili

---

## 8. Test sonuçları

Ayrı DB: `cto_dashboard_flyway_test`

| Kontrol | Sonuç |
|---|---|
| V1 migrate | Başarılı |
| Hibernate validate | Başarılı |
| Uygulama start | Başarılı |
| DevDataInitializer | 3 rol + admin |
| `flyway_schema_history` | version=1, success=t |
| İkinci açılış | `Schema "public" is up to date. No migration necessary.` |
| Health | 200 |
| Swagger | 200 |
| Login (ADMIN) | success |
| Dashboard summary | success (totalProjects=0 — temiz DB) |

Mevcut `cto_dashboard` verisi silinmedi / volume silinmedi.

---

## 9. Build sonucu

| Komut | Sonuç |
|---|---|
| `./mvnw test` | BUILD SUCCESS |
| `./mvnw clean package` | BUILD SUCCESS |

---

## 10. Açık riskler

1. Eski `cto_dashboard` baseline yapılmadan çalıştırılırsa startup fail
2. Hibernate’in geçmişte oluşturduğu constraint/index isimleri V1’den farklı olabilir (validate kolon odaklı; baseline sonrası V2 ile hizalama gerekebilir)
3. `schema.sql` referans index’leri V1’de yok — bilinçli
4. Prod’da DevDataInitializer yok; roller ayrı süreçle sağlanmalı

---

## 11. Sonraki öneriler

1. Günlük `cto_dashboard` için README’deki baseline’ı bir kez uygulamak
2. İhtiyaç halinde performans index’lerini `V2__...` ile eklemek
3. Prod rol seed stratejisini netleştirmek
4. CI’da boş Postgres + migrate + validate smoke test
