# Paint scroll V2 — rapport

## Verdict

**PAINT_SCROLL_V2_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`. Le site public reste la restauration Mùn.

## Site public restauré

| Élément | Valeur |
|---|---|
| Branche live | `main` |
| Commit rollback | `22d3008` — *Revert failed scroll paint experiment* |
| Base restaurée | `3857a34` — *Create immersive Mùn-inspired artisan experience* |
| Backup de l’échec | `backup/failed-scroll-paint-c99266f-20260829` (`c99266f`) |
| Pages | https://redav42-star.github.io/platrerie-peinture-forezienne/ |

Le commit `c99266f` n’est plus en production. `SCROLL_DRIVEN_PAINT_EXPERIENCE_COMPLETE` n’est pas une validation.

## Prototype

| Élément | Valeur |
|---|---|
| Branche | `prototype/scroll-paint-v2` |
| SHA | `991c6f8` |
| Base | `22d3008` |
| Photo | `assets/chantiers/display/20230922_120900.webp` (pièce finie, parquet, cheminée, portes-fenêtres) |
| Architecture | `<img>` couleur toujours en base + copie désaturée + 3 `<img>` couleur révélés par `clip-path: inset(...)` |
| Rouleau | SVG ~140 px desktop / 112 px mobile, z-index au-dessus du texte |
| Trace | ~24 % de hauteur viewport (3 bandes desktop, 2 mobile) — pas 12 px |
| Bord humide | 26 px + 3 coulures près du rouleau |
| Halo | radial-gradient centré sur `--rx` / `--ry` |
| Sticky | 200 vh desktop / 165 vh mobile |
| Scrub | scroll = progression, pause = pause, inverse = inverse |
| Fallback | sans JS / `prefers-reduced-motion` : photo couleur + H1 + CTA |

Ce n’est pas un faux Avant/Après. La section portfolio plus bas est inchangée.

## Vidéo regardée

Durées réelles :

- `reports/paint-v2/scroll-demo-desktop.mp4` — **14,0 s** (aller puis retour)
- `reports/paint-v2/scroll-demo-mobile.mp4` — **12,0 s**

Captures : `reports/paint-v2/00.png` … `100.png` (desktop) + `desktop-*` / `mobile-*`.

Lecture à vitesse normale :

1. Départ : photo sombre pleine page, jamais d’écran noir. H1 lisible. Le rouleau est encore discret.
2. Premier passage : bande couleur haute, rouleau évident à droite.
3. Passage milieu : bande large, rouleau vert/crème lisible, mot *Peindre*.
4. Fin : photo couleur complète, CTA, rouleau sorti. Transition vers Prestations naturelle (plus de 280 vh).
5. Retour : les bandes se referment, la photo redevient brute.

Question humaine : *un visiteur comprend-il que le rouleau peint la scène ?*  
**Oui dès le premier passage.** Moins au tout premier frame, où le rouleau démarre à gauche derrière le titre.

## Hard gates

| Gate | Résultat |
|---|---|
| `BLACK_EMPTY_FRAME_COUNT` | **0** (desktop + mobile, 00/25/50/75/100) |
| `ROLLER_NOT_OBVIOUS` | false pendant le scroll ; encore discret à 0 % |
| `PAINT_STROKE_TOO_THIN` | false (~24 % de hauteur) |
| `PHOTO_DISAPPEARS` | false |
| `SCENE_EMPTY_FOR_MORE_THAN_0_5S` | false |
| `TRANSITION_TO_SERVICES_ABRUPT` | false |
| `FULLSCREEN_VISUAL_ALWAYS_PRESENT` | true |
| `SCROLL_FORWARD_WORKS` | true |
| `SCROLL_REVERSE_WORKS` | true |
| `SCROLL_PAUSE_WORKS` | true (scrub, pas d’autoplay) |
| `MOBILE_WORKS` | true (2 passages, 165 vh) |

Luminances desktop (centre) : 77 → 96 → 114 → 131 → 159.  
Mobile : 76 → 92 → 94 → 128 → 135.

## SEO / régressions

| Contrôle | Résultat |
|---|---|
| `SEO_TEXT_CHANGED` | 0 (H1, paragraphe, titles, meta, canonical, JSON-LD, liens, URLs inchangés) |
| `BROKEN_IMAGES` | 0 |
| `BROKEN_INTERNAL_LINKS` | 0 |
| `JSON_LD_PARSE_ERRORS` | 0 |
| Erreurs JS | 0 |
| Menu overlay | 8 liens, visible |
| Lightbox chantier | présente |
| Avant/Après accueil | 1 bloc inchangé |
| Dégâts des eaux `.step` | 4 |

`lighthouse_visual_375.py` n’a pas été relancé ici : le serveur `:8000` local était instable (deux process). Les captures mobile 375 du prototype sont dans `reports/paint-v2/mobile-*.png`.

## Ce que le client doit voir

1. La vidéo desktop (14 s).
2. Éventuellement la vidéo mobile (12 s).
3. Le site public actuel (sans animation) reste en ligne sur `main`.

Si le rendu convient : merger manuellement `prototype/scroll-paint-v2` vers `main`.  
Sinon : ajuster uniquement sur cette branche.
