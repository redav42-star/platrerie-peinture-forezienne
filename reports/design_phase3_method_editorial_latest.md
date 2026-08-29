# Design phase 3 — Méthode de travail éditoriale

Verdict : **DESIGN_PHASE3_METHOD_EDITORIAL_COMPLETE**

## Git
- HEAD initial : `f25c27ec5637f55b8b9f30e7eee0f8bc889aaa4b`
- Fichiers : `styles.css`, `index.html` (classe `method`, sortie du `split` sombre)

## Layout
- Option A : grand chiffre Playfair **au-dessus** du titre (chiffre sémantique `<b>` existant, pas de doublon)
- Desktop / tablette (≥681 px) : 3 colonnes, `gap: clamp(40px, 6vw, 96px)`
- Mobile (≤680 px) : pile verticale, chiffres réduits
- Autres `.step` (dégâts des eaux, etc.) inchangés

## Couleurs
- Fond section : `#FDFBF7`
- Chiffres : `#D1C9BC`
- Titres : `#1A1A1A` (Playfair 600)
- Descriptions : `#5C574E` (Inter)

## QA
- BROKEN_IMAGES = 0
- BROKEN_INTERNAL_LINKS = 0
- CONSOLE_ERRORS = 0
- JS_RUNTIME_ERRORS = 0
- HORIZONTAL_OVERFLOW_PAGES = 0
- PAGES_WITHOUT_H1 = 0
- PAGES_WITH_MULTIPLE_H1 = 0
- CHANTIER_2023_INDEXABLE = OK
- Avant/Après, `.step` dégâts (blanc sur fond sombre), menu mobile = PASS

## Responsive
1440 / 1024 / 768 : 3 colonnes, overflow 0.
430 / 375 : 1 colonne, overflow 0.

## SEO
- SEO_TEXT_CHANGED = 0
- SEO_META_CHANGED = 0
- SEO_URL_CHANGED = 0
- SEO_INTERNAL_LINK_CHANGED = 0
