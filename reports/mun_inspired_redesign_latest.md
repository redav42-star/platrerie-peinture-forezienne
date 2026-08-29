# Refonte Mùn-inspired artisan

Verdict : **MUN_INSPIRED_ARTISAN_REDESIGN_COMPLETE**

## Git
- HEAD initial : `1f4f152571c1296f79c5db1e1f7e4f54d01ea9a1`
- Branche backup : `backup/before-mun-inspired-redesign-20260829` (même SHA, poussée sur origin)
- Fichiers : `index.html`, 11 pages internes (header/menu/footer), `styles.css`, `assets/js/site.js`, `scripts/apply_mun_chrome.py`, `scripts/lighthouse_visual_375.py`, captures, ce rapport

## Hero
Plein écran sombre (`#171714`), H1 crème `clamp(4rem, 8vw, 8rem)` / mobile `clamp(2.8rem, 12vw, 4.8rem)`, photo Après `20230922_120900` en colonne droite (~46 % desktop). Watermark CSS « Finition ». Bloc « Travaux réalisés » conservé.

## Menu overlay
Header minimal : Menu | logo | Devis. Overlay plein écran, typo serif, Escape, piège à focus, `aria-expanded` / `aria-controls`. Hover desktop : photo chantier en fond (fichiers du dépôt). Destinations : Accueil, Plâtrerie, Peinture & Airless, Rénovation, Dégâts des eaux, Réalisations, Contact, Devis.

## Logo
- Fichier inchangé : `assets/logo-premium.webp`
- Desktop : 102 px (+ fond crème)
- Mobile ≤900 : 68 px ; ≤580 : 64 px

## Prestations
Lignes éditoriales (plus de 9 cartes). Textes, H3 et liens conservés. Photo chantier en colonne sticky desktop, jamais superposée au texte.

## Photos
Hero / Après : `assets/chantiers/display/20230922_120900.webp`  
Avant : `20230530_095335.webp`  
Hover menu/prestations : `20241005_073140`, `20241005_073202`, `20241005_073208`, `20230922_120844`, `20230922_120855`, `20230530_095338`, `20240721_155050`  
Lightbox inchangée.

## Méthode / avis / CTA / footer
Méthode 1/2/3 immersive sur fond sombre (les `.step` dégâts des eaux restent cartes sombres, texte blanc). Avis typographiques. CTA devis quasi plein écran en fin de page. Footer sombre avec logo plus grand. Mentions légales inchangées.

## Animations
CSS + IntersectionObserver (~720 ms). `prefers-reduced-motion` respecté. Contenu visible sans JS (classe `.has-js` uniquement).

## Responsive
375 / 430 / 768 / 1024 / 1440 : overflow 0. Menu overlay testé 375 et 1440.

## QA
BROKEN_IMAGES = 0, BROKEN_INTERNAL_LINKS = 0, CONSOLE_ERRORS = 0, JS_RUNTIME_ERRORS = 0, HORIZONTAL_OVERFLOW_PAGES = 0, PAGES_WITHOUT_H1 = 0, PAGES_WITH_MULTIPLE_H1 = 0, JSON_LD_PARSE_ERRORS = 0, UNLABELED_MEANINGFUL_IMAGES = 0  
CHANTIER_2023_INDEXABLE = OK, CHANTIER_2023_DANS_SITEMAP = OK  
REGRESSION_HOME_BEFORE_AFTER / DEGATS_STEP_TEXT / MOBILE_MENU = PASS

## SEO
Titles, meta, canonical, robots, JSON-LD, H1/H2/H3 textes inchangés.  
SEO_TEXT_CHANGED = 0 (le H2 devis a changé de position, pas de libellé).  
SEO_META_CHANGED = 0, SEO_URL_CHANGED = 0.  
Liens internes existants conservés. Overlay : ajout de `renovation-appartement.html` et de la fiche chantier 2023 là où ils n’étaient pas dans le header (demandé par le brief).

## Captures
- Avant : `reports/mun-inspired-before/accueil-1440.png`, `accueil-375.png`
- Après : `reports/mun-inspired-after/accueil-1440.png`, `accueil-375.png`, `menu-1440.png`, `menu-375.png`, `prestations-1440.png`, `avant-apres-1440.png`
