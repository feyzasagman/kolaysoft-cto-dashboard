# GitHub Social Preview Guide

Kolaysoft CTO Dashboard için repository **Social Preview** kapak görseli.

## Final asset

| Alan | Değer |
| --- | --- |
| Path | [`docs/assets/social/kolaysoft-cto-dashboard-social-preview.png`](../assets/social/kolaysoft-cto-dashboard-social-preview.png) |
| Size | **1280 × 640** (aspect **2:1**) |
| Format | PNG |
| README | Bu görsel README’ye eklenmez; GitHub Settings’e manuel yüklenir |

## Kaynak screenshotlar

Product Tour gerçek uygulama yakalamaları:

| Kaynak | Rol |
| --- | --- |
| `docs/assets/screenshots/01-dashboard.png` | Ana katman — KPI + Dikkat Gerektiren Projeler |
| `docs/assets/screenshots/03-project-detail.png` | Ön katman — hero, metrikler, Yönetici Özeti |

`04-executive-insight.png` ayrı katman olarak kullanılmadı; Executive Insight, Project Detail crop’u içinde zaten görünür.

## Kompozisyon nedeni

- Recruiter / GitHub link önizlemesinde **ürünün kendisi** öne çıksın.
- Dashboard portföy sağlığını, Project Detail ise command center + insight’ı gösterir.
- Hafif overlap ile tek karede iki ekran; metin sade tutuldu (proje adı + bir satır value prop).
- Alt strip yalnızca stack isimleri: `Spring Boot · React · PostgreSQL · Docker · Playwright · CI`.
- Sahte logo / marketing badge yok.

## GitHub’a upload

1. Repo → **Settings** → **General**
2. **Social preview** bölümü
3. **Edit** / upload → `kolaysoft-cto-dashboard-social-preview.png` seç
4. Kaydet

Not: Social preview değişikliği bazen CDN/cache nedeniyle link paylaşımlarında gecikmeli yansır.

## Yeniden üretme / güncelleme

Product Tour screenshot’ları yenilendikten sonra:

```bash
python docs/tools/compose_social_preview.py
```

Script: [`docs/tools/compose_social_preview.py`](../tools/compose_social_preview.py)

Gereksinim: Python + Pillow (`pip install pillow` — yalnızca lokal üretim için).

Ardından aynı dosyayı GitHub Social preview alanına yeniden yükleyin.

## Hassas veri

Kaynaklarda yalnız demo/test verisi (`E2E-*`, `Day19`, `System Admin`, `@example.test`). Password / JWT / gerçek personel yok.
