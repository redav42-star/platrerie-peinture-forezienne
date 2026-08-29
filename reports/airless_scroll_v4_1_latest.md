# Airless scroll V4.1 — rapport

## Verdict

**AIRLESS_SCROLL_V4_1_READY_FOR_HUMAN_REVIEW**

Ne pas merger. Ne pas pousser sur `main`.

Le site public reste `22d3008`.

## Prototype

| | |
|---|---|
| Branche | `prototype/airless-scroll-v4-1` |
| SHA | *(renseigné après commit)* |
| Base | V4 `fa7243c` / public `22d3008` |
| Photo avant | `20230530_095338` — **même salon**, recadré haut : murs, fenêtres, corniches (plus le plancher encombré) |
| Photo après | `20230922_120855` — même salon fini, recadré sur le volume (cheminée, ouvertures, murs) |
| Direction | toujours sans pistolet / sans fumée |
| Sticky | **190 vh** desktop / **160 vh** mobile |

### Choix commercial

Les autres « avant » du chantier (`095335` plafond, `095504` couloir, `185634` circulation) ne sont pas le même cadrage salon.

La V4 montrait trop le sol et les sacs. Ici on garde la paire cohérente, mais on **cadre la pièce** : menuiseries, murs, volume. Le bazar au sol sort du champ.

## Vidéos et captures

- `reports/airless-v4-1/scroll-demo-desktop.mp4` — **17,2 s**
- `reports/airless-v4-1/scroll-demo-mobile.mp4` — **13,0 s**
- Stills `00` / `25` / `50` / `75` / `100`

## Tests

| Contrôle | Résultat |
|---|---|
| Frames noirs | 0 |
| Console | 0 |
| Overflow 375 / 768 / 1440 | non |
| Menu | 8 liens |
| Images / liens | 0 cassé |
| H1 | Plâtrier peintre à Saint-Étienne |
| SEO statique | 0 régression |

## À regarder

`reports/airless-v4-1/scroll-demo-desktop.mp4`

Test humain à 50 % : **la scène est-elle belle et vendeuse, sans gros plan sur le bazar ?**
