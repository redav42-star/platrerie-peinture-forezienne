# Airless scroll V4 — rapport

## Verdict

**AIRLESS_SCROLL_V4_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`.

Le site public reste le rollback Mùn (`22d3008`).
La V3.1 reste sur `prototype/airless-scroll-v3-1` et n’est pas mergée.

## Prototype

| | |
|---|---|
| Branche | `prototype/airless-scroll-v4` |
| SHA | *(renseigné après commit)* |
| Base | `5fe05e1` (V3.1) / public `22d3008` |
| Photo avant | `assets/chantiers/display/20230530_095338.webp` — salon en chantier |
| Photo après | `assets/chantiers/display/20230922_120855.webp` — même salon fini |
| Direction | plus de pistolet SVG, plus de brume, plus de halo |
| Architecture | photo avant + canvas : la finition s’étend par taches organiques et révèle l’après |
| Sticky | **190 vh** desktop / **160 vh** mobile |
| Scrub | scroll = progression, pause = pause, inverse = inverse |
| Fallback | sans JS / `prefers-reduced-motion` : photo après + H1 + CTA |

### Pourquoi ce choix

Les retours V3.1 pointaient l’icône de pistolet et l’effet lumineux. La V4 fait porter toute l’expérience par les **vraies photos** : le chantier reste lisible, puis la matière finie (parquet, murs clairs) gagne la pièce. L’outil n’est plus mis en scène.

## Vidéos et captures

- `reports/airless-v4/scroll-demo-desktop.mp4` — **19,2 s** (descente, pause, remontée)
- `reports/airless-v4/scroll-demo-mobile.mp4` — **13,5 s**
- Stills : `reports/airless-v4/00.png` … `100.png` + `desktop-*` / `mobile-*`

Lecture : 0 % chantier ; dès ~25 % une zone finie apparaît côté fenêtres / sol ; à 50 % coexistence claire avant / après ; à 100 % salon fini + CTA.

## Hard gates

| Gate | Résultat |
|---|---|
| `BLACK_EMPTY_FRAME_COUNT` | **0** |
| `CONSOLE_ERRORS` | 0 |
| `MOBILE_OVERFLOW` | false |
| `BROKEN_LINKS` | 0 |
| `BROKEN_IMAGES` | 0 |
| `SEO_CONTENT_PRESERVED` | true |
| `FULLSCREEN_SCENE_ALWAYS_PRESENT` | true |
| `SCROLL_FORWARD_WORKS` | true |
| `SCROLL_REVERSE_WORKS` | true |
| `SCROLL_PAUSE_WORKS` | true |
| `MOBILE_VERSION_USABLE` | true |
| `USER_UNDERSTANDS_BEFORE_TO_AFTER` | true |
| `GUN_LOOKS_FLOATING` | n/a — pistolet retiré |
| `FLASHLIGHT_EFFECT` | false — plus de halo / brume crème |

Luminances desktop (centre) : 106 → 109 → 111 → 110 → 111.

## QA

| Contrôle | Résultat |
|---|---|
| Images / liens internes / JSON-LD | 0 erreur |
| Menu overlay | 8 liens |
| Lightbox chantier | présent |
| Avant/Après accueil | 1 |
| Overflow 375 / 1440 | non |
| Erreurs JS | 0 |
| H1 | Plâtrier peintre à Saint-Étienne |

## À regarder avant tout merge

Ouvrir `reports/airless-v4/scroll-demo-desktop.mp4`.

Le test humain : **est-ce que le chantier devient le résultat, sans gadget et sans effet de torche ?**
