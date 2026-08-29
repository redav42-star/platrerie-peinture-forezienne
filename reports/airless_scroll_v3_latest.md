# Airless scroll V3 — rapport

## Verdict

**AIRLESS_SCROLL_V3_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`.

Le site public reste le rollback Mùn (`22d3008`).

## Prototype

| | |
|---|---|
| Branche | `prototype/airless-scroll-v3` |
| Base | `22d3008` |
| Photo | `assets/chantiers/display/20230922_120900.webp` — pièce finie, parquet, cheminée, portes-fenêtres |
| Architecture | photo couleur toujours en base + calque sombre + canvas de révélation (nuages elliptiques flous le long d’un trajet, pas de `clip-path` en bandes) |
| Pistolet | SVG métallique + poignée verte, ~280 px desktop, trajet dans la moitié photo (pas sur le H1) |
| Pulvérisation | ellipses allongées + halo + brume + particules au bec |
| Sticky | **190 vh** desktop / **160 vh** mobile |
| Scrub | scroll = progression, pause = pause, inverse = inverse |
| Fallback | sans JS / `prefers-reduced-motion` : photo claire + H1 + CTA |

Ce n’est pas un Avant/Après. La section portfolio plus bas est inchangée.

## Vidéos et captures

- `reports/airless-v3/scroll-demo-desktop.mp4` — **15,4 s** (descente, pause, remontée)
- `reports/airless-v3/scroll-demo-mobile.mp4`
- Stills : `reports/airless-v3/00.png` … `100.png` + `desktop-*` / `mobile-*`

Lecture : au départ la pièce est mate et le pistolet entre à droite ; le nuage de lumière/couleur suit le geste en forme organique (pas de stores) ; à la fin la pièce est claire, CTA visibles, pistolet sorti ; en remontant l’effet se referme.

## Hard gates

| Gate | Résultat |
|---|---|
| `BLACK_EMPTY_FRAME_COUNT` | **0** |
| `EFFECT_LOOKS_LIKE_RECTANGLES` | false |
| `EFFECT_LOOKS_LIKE_STORES` | false (nuage diagonal / elliptique) |
| `AIRLESS_GUN_NOT_CREDIBLE` | discutable — SVG travaillé, plus grand, dans la scène ; ce n’est pas une photo réelle |
| `PAINT_REVEAL_NOT_OBVIOUS` | false dès ~25 % |
| `SCENE_FEELS_EMPTY` | false |
| `TRANSITION_TO_NEXT_SECTION_ABRUPT` | false |
| `SEO_TEXT_CHANGED_UNNECESSARILY` | false |
| `MOBILE_OVERFLOW` | false |
| `FULLSCREEN_SCENE_ALWAYS_PRESENT` | true |
| `SCROLL_FORWARD_WORKS` | true |
| `SCROLL_REVERSE_WORKS` | true |
| `SCROLL_PAUSE_WORKS` | true |
| `MOBILE_VERSION_USABLE` | true |

Luminances desktop (centre) : 85 → 101 → 117 → 132 → 158.

## QA

| Contrôle | Résultat |
|---|---|
| Images / liens internes / JSON-LD | 0 erreur |
| Menu overlay | 8 liens |
| Lightbox chantier | OK |
| Avant/Après accueil | 1 |
| Dégâts `.step` | 4 |
| Erreurs JS | 0 |

## À regarder avant tout merge

Ouvrir `reports/airless-v3/scroll-demo-desktop.mp4`.

Si le pistolet SVG reste trop « illustration », on itère encore **sur cette branche**.
