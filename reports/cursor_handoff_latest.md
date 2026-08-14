# Verdict
PHOTO_SITE_AUDIT_FIXED

# ZIP photos
- emplacement trouvé : `D:\TELERCHAR\photos-chantiers-originaux-pour-cursor.zip` (12 293 199 o, 14/08/2026 14:47)
- nombre de photos extraites : 26
- dossier cible : `assets/chantiers/import-originals/` (sources locales, non publiées)
- versions web : `assets/chantiers/web/` (26 JPEG, côté long ≤ 1800 px, qualité 90, aucun upscale)
- vérification manifest : SHA256 et dimensions OK pour les 26 fichiers
- `CONTACT_SHEET_AUDIT_NE_PAS_PUBLIER.jpg` : utilisée uniquement pour l’audit visuel, **jamais publiée**

# Etat initial
- SHA initial : `fdd500c206e702f9dcba5fc86cabc1ef5be3e666`
- JPEG `assets/chantiers/2023/avant-piece.jpg` et `avant-plafond.jpg` présents mais **tronqués** (`broken data stream`) : les navigateurs ne les décodent pas
- `apres-salon.jpg` / `apres-couloir.jpg` valides mais miniatures ~300×532 (~8–9 Ko) : floues une fois agrandies
- seulement 3–4 photos visibles sur le site alors que 26 originaux étaient fournis

# Bug photo AVANT accueil
- cause exacte : le fichier `assets/chantiers/2023/avant-piece.jpg` était un JPEG corrompu (flux tronqué). Le chemin HTML était correct, le fichier existait, mais le décodage échouait.
- correction exacte : remplacement par l’original `20230530_095335.jpg` exporté en `assets/chantiers/web/20230530_095335.jpg` (1012×1800, ~268 Ko), JPEG valide, `object-fit: contain`

# Inventaire photos
- 26 originaux fournis
- photos chantier 2023 confirmées (8/8 affichées sur la fiche) :
  - Avant : `20230530_095335.jpg`, `20230530_095504.jpg`
  - Pendant : `20230530_095338.jpg`, `20230711_185634.jpg`, `20230922_120844.jpg`
  - Après : `20230922_120655.jpg`, `20230922_120855.jpg`, `20230922_120900.jpg`
- autres photos utilisées (sans inventer commune / date / travaux) :
  - placo / cloisons : `20240618_104920.jpg`, `20250815_123931.jpg`, `Snapchat-42290463.jpg`
  - bandes à joints : `20240721_155050.jpg`, `20250815_123931.jpg`
  - ratissage / enduits : `20241005_073208.jpg`, `20241005_073140.jpg`, `20241005_073202.jpg`
  - peinture / Airless : `IMG-20240430-WA0004.jpg`, `20241005_073045.jpg`, `20241115_145214.jpg`, `20241115_145305.jpg`, `20241116_150146.jpg`, `Snapchat-848538168.jpg`
- photos non utilisées (sujet ambigu ou hors prestation claire, pour ne pas inventer) :
  - `20241005_073226.jpg` (série déjà représentée)
  - `20241115_145553.jpg` (série déjà représentée)
  - `20251118_122319.jpg` (poêle, hors plâtrerie/peinture)
  - `20260217_151910.jpg` (non attribuée de façon sûre)
  - `20260306_180522.jpg` (chantier trop encombré / hors focus)
- anciennes miniatures remplacées : `avant-piece.jpg`, `avant-plafond.jpg`, `apres-salon.jpg`, `apres-couloir.jpg` ne sont plus liées

# Qualité
Pour les principales images :
- `20230530_095335.jpg` : source 1152×2048 / 430 Ko → web 1012×1800 / 274 Ko — aucune upscale — contrôle visuel OK (plafond fissuré lisible)
- `20230922_120900.jpg` : source 1155×2048 / 462 Ko → web 1015×1800 / 303 Ko — aucune upscale — contrôle visuel OK
- `20230922_120855.jpg` : source 1155×2048 / 459 Ko → web 1015×1800 / 299 Ko — aucune upscale — contrôle visuel OK
- `IMG-20240430-WA0004.jpg` : source 1512×2016 / 170 Ko → web 1350×1800 / 257 Ko — aucune upscale
- `Snapchat-848538168.jpg` : source 900×1200 conservée (pas d’upscale)
- JPEG qualité 90, ratio conservé, orientation EXIF corrigée si besoin

# Fichiers modifiés
- `index.html`, `chantier-renovation-appartement-saint-etienne-2023.html`, `renovation-appartement.html`
- `platrerie.html`, `cloisons-faux-plafonds.html`, `bandes-a-joints-jointeur.html`, `ratissage-enduits.html`, `peinture-airless.html`
- `styles.css`
- `assets/js/gallery.js` (lightbox légère, créée au clic)
- `assets/chantiers/web/*.jpg` (26)
- `tools/audit_site.py`, `tools/generate_web_photos.py`, `tools/http_check_pages.py`
- `.gitignore` (originaux + planche contact exclus du dépôt public)
- `reports/cursor_handoff_latest.md`, `reports/asset_audit.json`, `reports/web_photos.json`

# Tests
- 375 : overflow X = non, Avant/Après visibles, CTA mobile OK
- 430 : overflow X = non
- 768 : overflow X = non
- 1024 : overflow X = non, photo Avant OK
- 1440 : overflow X = non, bloc Avant/Après net, 8 photos fiche 2023 OK
- images 404 : 0 (HTTP local)
- liens cassés : 0
- screenshots : accueil desktop, accueil mobile 375, fiche chantier 2023
- serveur local : `python -m http.server 8000`

# SEO safety
CHANTIER_2023_NOINDEX = OK
CHANTIER_2023_HORS_SITEMAP = OK

# Git
- SHA initial : `fdd500c206e702f9dcba5fc86cabc1ef5be3e666`
- SHA final : (à compléter après commit)
- push : (à compléter)
- build GitHub Pages : (à compléter)

# Résultat final
BROKEN_IMAGES = 0
BROKEN_INTERNAL_LINKS = 0
PHOTOS_ORIGINALES_RECUPEREES = 26
PHOTOS_2023_AFFICHEES = 8
BUILD_PAGES = (à compléter)

# Actions restantes
- Vérifier le build GitHub Pages après push.
- Les 5 photos non attribuées peuvent être ajoutées plus tard si le propriétaire confirme le chantier / la prestation.
- La fiche chantier 2023 reste volontairement `noindex` et hors sitemap jusqu’à validation globale du site.
