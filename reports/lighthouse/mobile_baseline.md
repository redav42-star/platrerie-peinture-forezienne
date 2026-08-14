# Lighthouse mobile — baseline

Date : 14/08/2026  
Outil : Lighthouse 12.8.2 via Chromium Playwright, form-factor mobile (Moto G Power, throttling simulé)  
3 runs par page, médiane Performance.

Site public testé : https://redav42-star.github.io/platrerie-peinture-forezienne/  
INITIAL_SHA : `4dc36192b79991adcc86a25fd2dd8771eebd8190`

## Médianes

| Page | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT | FCP | SI |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Accueil | 89 | 100 | 100 | 100 | 3773 ms | 0 | 0 | 912 ms | 2189 ms |
| Dégâts des eaux | 100 | 100 | 100 | 100 | 877 ms | 0 | 0 | 877 ms | 877 ms |
| Rénovation appartement | 100 | 100 | 100 | 100 | 842 ms | 0 | 0 | 842 ms | 842 ms |
| Chantier 2023 | 100 | 100 | 100 | 66 | 840 ms | 0 | 0 | 840 ms | 840 ms |
| Contact | 100 | 100 | 96 | 100 | 862 ms | 0 | 0 | 862 ms | 862 ms |

## 5 causes principales (accueil, page la plus lente)

1. `fetchpriority="high"` sur la photo Avant, hors viewport mobile (~6628 px) : LCP = paragraphe du hero, mais 81 % du LCP est un *render delay* (concurrence réseau avec ~270–300 Ko de JPEG).
2. Images d’affichage trop grandes (`uses-responsive-images`, ~373 KiB) : JPEG 1012×1800 affichés ~386×520.
3. Formats next-gen absents (`modern-image-formats`, ~305 KiB).
4. Cache GitHub Pages court sur les images (hors contrôle du dépôt, sans `_headers`).
5. TTFB GitHub Pages ~120–150 ms (externe).

## Autres pages

- Dégâts / rénovation / chantier 2023 : Performance déjà 100 (photos en `loading="lazy"` sous la ligne de flottaison, LCP textuel).
- Chantier 2023 SEO 66 : audit `is-crawlable` à cause de `noindex,follow` **volontaire**. Ne pas corriger.
- Contact Best Practices 96 : `image-size-responsive` — logo 240×240 affiché trop large dans `.hero-card`.

## Runs bruts Performance

- Accueil : 88 / 89 / 89
- Dégâts : 100 / 100 / 100
- Rénovation : 100 / 100 / 100
- Chantier 2023 : 100 / 100 / 100
- Contact : 100 / 100 / 100

JSON : `reports/lighthouse/mobile_baseline_summary.json`  
Rapports : `reports/lighthouse/mobile/baseline/`
