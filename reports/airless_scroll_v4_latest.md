# Airless scroll V4 — rapport

## Verdict

**AIRLESS_SCROLL_V4_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`.

Le site public reste le rollback Mùn (`22d3008`).

## Prototype

| | |
|---|---|
| Branche | `prototype/airless-scroll-v4` |
| SHA | `ef89ff4` |
| Base | V3.1 `5fe05e1` / public `22d3008` |
| Photo avant | `20230530_095338` — salon en chantier |
| Photo après | `20230922_120855` — même salon fini |
| Direction | plus de pistolet, plus de brume ; la finition avance du sol vers la pièce |
| Sticky | **190 vh** desktop / **160 vh** mobile |
| Scrub | scroll = progression, pause = pause, inverse = inverse |
| Fallback | sans JS / `prefers-reduced-motion` : photo après + H1 + CTA |

### Lecture visuelle

- 0 % : chantier lisible, H1 + CTA déjà présents
- 25 % : le parquet fini apparaît au sol
- 50 % : sol / lumière déjà après, cheminée encore avant
- 75–100 % : pièce finie, CTA conservés

## Vidéos et captures

- `reports/airless-v4/scroll-demo-desktop.mp4` — **19,7 s**
- `reports/airless-v4/scroll-demo-mobile.mp4` — **14,3 s**
- Stills : `00` / `25` / `50` / `75` / `100` + `desktop-*` / `mobile-*`

## Tests

| Contrôle | Résultat |
|---|---|
| `BLACK_EMPTY_FRAME_COUNT` | **0** |
| Erreurs console | 0 |
| Overflow 375 / 393 / 768 / 1024 / 1280 / 1440 / 1920 | non |
| Images / liens cassés | 0 |
| Menu mobile | 8 liens |
| Lightbox / Avant-Après | OK |
| Pages contact, dégâts, peinture | pas d’overflow, pas d’erreur JS |
| H1 | Plâtrier peintre à Saint-Étienne |
| CTA dès 0 % | oui |
| SEO statique | 0 régression |

Luminances desktop (centre) : 101 → 105 → 115 → 111 → 110.

## À regarder

Ouvrir `reports/airless-v4/scroll-demo-desktop.mp4`.

Test humain : **le chantier devient-il le résultat, du sol vers la pièce, sans gadget ?**
