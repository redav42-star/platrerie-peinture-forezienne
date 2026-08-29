# Expérience scroll « le rouleau peint le chantier »

Verdict : **SCROLL_DRIVEN_PAINT_EXPERIENCE_COMPLETE**

## Git
- HEAD initial : `3857a3442bd978cf542794f09a1cf1453ed01da1`
- Branche backup : `backup/before-scroll-paint-experience-20260829` (même SHA, poussée sur origin)

## Architecture
Section `.paint-story` (280 vh desktop / 200 vh mobile) avec scène sticky `100svh`.
`assets/js/paint-scroll.js` calcule `progress = (scrollY - offsetTop) / (height - innerHeight)`, puis pilote via `requestAnimationFrame` des custom properties (`--b1/2/3`, `--rx/ry/rr`).
Pas de GSAP, pas de WebGL. Si la molette s’arrête, la scène reste. Remonter rewind.

## Photos
- Avant : `assets/chantiers/display/20230530_095335.webp`
- Après : `assets/chantiers/display/20230922_120900.webp`
Les deux restent dans le HTML (alts inchangés). Le portfolio Avant/Après plus bas est intact.

## Rouleau
SVG inline (manche vert marque, tige charbon, manchon crème), `aria-hidden="true"`. Petit pot en début de scène.

## Trajectoire
Desktop, 3 passages en zigzag :
- 0–30 % : gauche → droite, haut
- 30–58 % : droite → gauche, milieu
- 58–82 % : gauche → droite, bas
- 82–100 % : sortie + photo Après complète

Mobile : 2 passages, 200 vh.

Reveal : 3 bandes `overflow` + `background-position` (pas un fade). Fine lisière crème + quelques coulures.

## Reduced motion
Pas de sticky long. Photo Après visible, H1 et CTA accessibles. Classe `paint-ready` non appliquée.

## SEO
H1, meta, canonical, JSON-LD, liens internes inchangés.
Mots décoratifs Préparer / Peindre / Révéler : `aria-hidden`.

## QA
BROKEN_IMAGES = 0, BROKEN_INTERNAL_LINKS = 0, CONSOLE_ERRORS = 0, JS_RUNTIME_ERRORS = 0, HORIZONTAL_OVERFLOW_PAGES = 0, JSON_LD_PARSE_ERRORS = 0
REGRESSION_MOBILE_MENU / HOME_BEFORE_AFTER / DEGATS_STEP_TEXT = PASS
SCROLL_PAINT_FORWARD / REVERSE / PAUSE / MOBILE = PASS
REDUCED_MOTION_FALLBACK = PASS

## Captures
`reports/paint-scroll/desktop-00.png` … `desktop-100.png`
`reports/paint-scroll/mobile-00.png`, `mobile-50.png`, `mobile-100.png`
