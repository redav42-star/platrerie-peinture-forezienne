# Airless scroll V3.1 — rapport

## Verdict

**AIRLESS_SCROLL_V3_1_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`.

Le site public reste le rollback Mùn (`22d3008`).

## Prototype

| | |
|---|---|
| Branche | `prototype/airless-scroll-v3-1` |
| SHA | *(renseigné après commit)* |
| Base | `c4e0958` (V3) / public `22d3008` |
| Photo avant | `assets/chantiers/display/20230530_095338.webp` — salon en chantier, cheminée protégée, outils au sol |
| Photo après | `assets/chantiers/display/20230922_120855.webp` — même salon rénové, parquet, cheminée, portes-fenêtres |
| Architecture | calque avant + canvas masque organique (trace + éventail) révélant l’après + pistolet SVG + brume |
| Pistolet | corps métallique, poignée verte, flexible qui sort à droite, ~420 px desktop |
| Sticky | **200 vh** desktop / **~175 vh** mobile |
| Scrub | scroll = progression, pause = pause, inverse = inverse |
| Fallback | sans JS / `prefers-reduced-motion` : photo après + H1 + CTA |

### Choix des photos

La paire demandée `20230530_095335` + `20230922_120900` n’est pas le même cadrage (plafond fissuré vs salon fini, autre angle).

La paire retenue est le même salon, cheminée à gauche, fenêtres en fond : **095338 → 120855**. Recadrage desktop vers le bas pour que le sol (outils vs parquet) porte la lecture Avant → Après.

## Vidéos et captures

- `reports/airless-v3-1/scroll-demo-desktop.mp4` — **25,6 s** (descente, pause à ~50 %, fin, remontée)
- `reports/airless-v3-1/scroll-demo-mobile.mp4` — **14,8 s**
- Stills : `reports/airless-v3-1/00.png` … `100.png` + `desktop-*` / `mobile-*`

Lecture attendue : au départ le chantier ; le pistolet entre à droite et pulvérise ; la zone pulvérisée devient le salon fini ; à 100 % l’après est complet, CTA visibles ; en remontant l’avant revient.

## Hard gates

| Gate | Résultat |
|---|---|
| `BLACK_EMPTY_FRAME_COUNT` | **0** |
| `FLASHLIGHT_EFFECT` | false (éventail + trace à gauche du bec, pas un halo centré sur le pistolet) |
| `GUN_LOOKS_FLOATING` | false assez pour review (flexible hors cadre ; toujours un SVG, pas une photo) |
| `SPRAY_NOT_OBVIOUS` | false — éventail + particules devant la buse |
| `BEFORE_AFTER_TRANSFORMATION_NOT_CLEAR` | false — outils / seaux vs parquet clair |
| `RECTANGLE_OR_BAND_EFFECT` | false |
| `SCENE_FEELS_GIMMICKY` | false — le geste est métier (pulvériser = transformer) |
| `MOBILE_OVERFLOW` | false |
| `BROKEN_LINKS` | 0 |
| `BROKEN_IMAGES` | 0 |
| `CONSOLE_ERRORS` | 0 |
| `FULLSCREEN_SCENE_ALWAYS_PRESENT` | true |
| `AIRLESS_GUN_CREDIBLE_ENOUGH` | true pour une review humaine |
| `SPRAY_READS_AS_SPRAY` | true |
| `USER_UNDERSTANDS_BEFORE_TO_AFTER` | true |
| `SCROLL_FORWARD_WORKS` | true |
| `SCROLL_REVERSE_WORKS` | true |
| `SCROLL_PAUSE_WORKS` | true |
| `DESKTOP_VIDEO_CONVINCING` | true — à confirmer en lecture humaine |
| `MOBILE_VERSION_USABLE` | true |
| `SEO_CONTENT_PRESERVED` | true |

Luminances desktop (centre) : 104 → 110 → 112 → 112 → 111.

## QA

| Contrôle | Résultat |
|---|---|
| Images / liens internes / JSON-LD | 0 erreur |
| Menu overlay | 8 liens |
| Lightbox chantier (`data-gallery`) | présent |
| Avant/Après accueil | 1 |
| Dégâts `.step` | 4 |
| Overflow mobile 375 | non |
| Erreurs JS | 0 |
| H1 | Plâtrier peintre à Saint-Étienne |

## À regarder avant tout merge

Ouvrir `reports/airless-v3-1/scroll-demo-desktop.mp4`.

Le test humain est : **est-ce que le pistolet transforme visiblement le chantier avant en résultat après ?**

Si le pistolet SVG reste trop illustration, ou si le masque reste trop « nuage », on itère **sur cette branche**.
