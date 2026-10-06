# Audit SEO technique, Bing et performance PPF

Date : 6 octobre 2026 (Europe/Paris).
Dépôt : [redav42-star/platrerie-peinture-forezienne](https://github.com/redav42-star/platrerie-peinture-forezienne).
Référence auditée : `main`, commit `193dd7b57ff2e21d2b6713eeb7873f7346c538c8`.
Branche de livraison : `audit-seo-technique-bing-2026-10-06`.
Commit technique : `a95086e1360efea58b2c8ad23be6c08fc4e08098`.
Site : https://redav42-star.github.io/platrerie-peinture-forezienne/

## 1. Résumé exécutif

Le site PPF est accessible et techniquement bien préparé. Les 12 pages éditoriales répondent HTTP 200, possèdent une canonical exacte, une description unique, un titre unique, un seul H1 et un JSON-LD valide. Les 11 pages secondaires ont un BreadcrumbList. Aucun lien interne ni aucune ressource référencée en erreur n'a été trouvé dans le périmètre vérifié.

Le contrôle HTTP couvre **106 URL du projet**, toutes HTTP 200, sans redirection. Deux URL supplémentaires servent au diagnostic hors périmètre : la racine du compte GitHub et son robots.txt, toutes deux HTTP 404.

**Bilan des constats, regroupés par cause : 4 constats techniques confirmés, 3 corrigés sur la branche, 1 non corrigé car il relève de la racine du domaine, hors de ce dépôt.** Les corrections concernent les contrôles, IndexNow et une dépendance de développement. Elles ne corrigent pas des 404 inexistantes sur les pages PPF.

L'hypothèse d'un mauvais périmètre Ahrefs est fortement étayée par les réponses HTTP, mais la cause précise des quatre erreurs historiques reste non prouvée : les quatre URL et les réglages du crawl du 30 septembre n'ont pas pu être obtenus. Le connecteur Ahrefs refuse la lecture des projets avec « Insufficient plan ».

Aucune modification de main, aucune fusion, aucun déploiement volontaire et aucune soumission IndexNow réelle n'ont été effectués pendant cet audit. Le HTML public, les textes, les coordonnées, les photos, le CSS et les dates du sitemap restent identiques.

## 2. Problèmes confirmés

| ID | Constat et preuve | Effet | État |
| --- | --- | --- | --- |
| C1 | Le robots.txt PPF est dans le sous-répertoire ; le véritable /robots.txt du domaine répond 404. Ses Disallow utilisent aussi /scripts/, /reports/, etc., sans préfixe PPF. | Les exclusions et la déclaration du sitemap de ce fichier ne sont pas appliquées comme un robots.txt de domaine. | Non corrigé : intervention à la racine du domaine nécessaire. |
| C2 | Le contrôle initial utilisait une liste fixe de 12 pages et des expressions régulières. Il ignorait les URL absolues du même domaine hors base, les posters vidéo, les polices CSS, les ancres entre pages, la casse sous Windows, les nouvelles pages et les destinations JSON-LD. | Des régressions pouvaient passer le contrôle existant. | Corrigé : parseurs HTML/XML et tests par défauts injectés. |
| C3 | IndexNow masquait les erreurs de git diff en sélectionnant tout le sitemap ; le workflow ne récupérait que deux commits ; les délais Pages + clé pouvaient dépasser les 8 minutes du job. Les changements de ressources partagées n'étaient pas signalés. | Notifications trop larges, manquantes ou interrompues dans ces cas. | Corrigé : échec explicite, historique complet, délais bornés et budget cohérent, sélection des pages affectées. |
| C4 | npm audit identifiait source-map-js 1.2.1, vulnérabilité élevée GHSA-68fv-2mgg-jv7q. | Risque dans l'outillage de développement ; aucun script source-map-js n'est livré au navigateur public. | Corrigé : 1.2.2 ; installation propre avec zéro vulnérabilité signalée. |

C3 inclut aussi l'exclusion du fichier de vérification Google des notifications, la déduplication et la conservation des notifications de suppression lorsque le sitemap change. Ces protections sont incluses dans le même constat de fiabilité IndexNow ; le tableau compte les causes, pas chaque assertion de test.

La vulnérabilité de développement est documentée dans [l'avis GitHub officiel](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

## 3. Faux positifs et limites des outils externes

Le Health Score 0 communiqué pour Ahrefs ne peut pas être transposé aux pages PPF sans connaître les URL et le périmètre réellement audités. Les quatre URL historiques ne sont pas inventées dans ce rapport.

Une 404 sur https://redav42-star.github.io/ n'est pas une 404 sur l'accueil PPF. Aucun renvoi artificiel ni aucune page à la racine du compte n'a été ajouté.

Un fichier robots.txt accessible dans un sous-répertoire ne prouve pas que ses règles sont prises en compte. Le fichier doit être situé à la racine de l'hôte. [Documentation Google sur son emplacement](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

Une 404 du robots.txt racine n'implique pas un blocage Google : Google traite les 4XX, sauf 429, comme une absence de restrictions de crawl. Cela ne prouve pas qu'un moteur a effectivement exploré les pages. [Interprétation Google des réponses HTTP](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec).

Les scores Lighthouse sont des mesures de laboratoire ponctuelles, pas des données Core Web Vitals de visiteurs ni une garantie d'indexation.

## 4. Diagnostic exact des 404 et inventaire

| URL | HTTP | Périmètre |
| --- | --- | --- |
| https://redav42-star.github.io/ | 404 | Racine du compte, hors PPF |
| https://redav42-star.github.io/robots.txt | 404 | Robots de l'hôte, hors dépôt PPF |
| https://redav42-star.github.io/platrerie-peinture-forezienne/ | 200 | Accueil réel |
| https://redav42-star.github.io/platrerie-peinture-forezienne/robots.txt | 200 | Fichier présent, emplacement non reconnu comme robots de l'hôte |
| https://redav42-star.github.io/platrerie-peinture-forezienne/sitemap.xml | 200 | Sitemap PPF |
| https://redav42-star.github.io/platrerie-peinture-forezienne/608163cc152a07304fbc7afd2284609f.txt | 200 | Clé IndexNow, contenu exact |

Les fichiers du dépôt initial comprennent 145 fichiers suivis, dont 120 fichiers sous assets, 13 fichiers HTML à la racine, deux scripts de contrôle/soumission et un workflow IndexNow. Le HTML de vérification Google est un fichier technique, exclu à juste titre du sitemap éditorial.

Préfixe commun de toutes les pages ci-dessous : https://redav42-star.github.io/platrerie-peinture-forezienne/

| Page canonique sous ce préfixe | HTTP | H1 | Métadonnées, liens, ressources et JSON-LD | Profondeur depuis l'accueil |
| --- | --- | --- | --- | --- |
| / (fichier index.html) | 200 | 1 | Valides | 0 |
| platrerie.html | 200 | 1 | Valides | 1 |
| bandes-a-joints-jointeur.html | 200 | 1 | Valides | 1 |
| peinture-airless.html | 200 | 1 | Valides | 1 |
| ratissage-enduits.html | 200 | 1 | Valides | 1 |
| cloisons-faux-plafonds.html | 200 | 1 | Valides | 1 |
| renovation-appartement.html | 200 | 1 | Valides | 1 |
| chantier-renovation-appartement-saint-etienne-2023.html | 200 | 1 | Valides | 1 |
| degats-des-eaux.html | 200 | 1 | Valides | 1 |
| quand-repeindre-apres-degat-des-eaux.html | 200 | 1 | Valides | 1 |
| professionnels.html | 200 | 1 | Valides | 1 |
| contact.html | 200 | 1 | Valides | 1 |

Le fichier googledc9bb4fdc88e0307.html répond aussi HTTP 200. Il reste intact : il sert à la vérification Google, pas à une page commerciale.

Le détail page par page, avec les valeurs exactes des titles, descriptions, H1/H2/H3, canonical, OpenGraph, JSON-LD, références et dimensions, est dans `inventaire-et-mesures.json`. Le journal des réponses est dans `http-audit.json`.

Toutes les canonical et og:url conservent le sous-répertoire et HTTPS. Les URL d'images du sitemap, les favicons, CSS, JavaScript, polices, posters, vidéos et images srcset sont accessibles. Les ressources locales ont été contrôlées avec une casse exacte, y compris sur Windows.

Les ancres locales et entre pages sont valides. Le JavaScript lu crée une galerie à partir de liens HTML existants et un lien mailto ; il ne génère pas d'URL de page vers la racine du compte. assets/js/airless-scroll.js n'est pas référencé par les pages actuelles ; sa présence seule n'alourdit pas leur chargement.

Le HTML téléchargé de chacune des 12 pages correspond au commit audité, après normalisation des fins de ligne. Il n'y a pas de page orpheline, de doublon de title ou description, ni de noindex/nofollow accidentel détecté.

**Conclusion Ahrefs :** le scénario B, mauvais périmètre, est compatible avec les preuves actuelles et constitue l'hypothèse principale. Le scénario A, quatre erreurs actuelles provoquées par les références du site PPF, n'est pas reproduit. On ne peut pas attribuer avec certitude les quatre erreurs du 30 septembre sans l'export historique. Aucun score Ahrefs avant/après n'est affirmé.

## 5. Corrections apportées

- Ajout de parse5 et fast-xml-parser comme dépendances de développement pour analyser les structures HTML et XML.
- Découverte des pages HTML publiques à la racine, avec exception explicite du fichier de vérification Google.
- Résolution des URL par rapport à la véritable base GitHub Pages et refus des chemins du même hôte hors préfixe PPF.
- Vérification de l'existence et de la casse des ressources, des posters vidéo, des CSS et polices, des ancres entre pages et des URL JSON-LD.
- Contrôle des canonical et og:url uniques, des titres et descriptions uniques, du H1, de la hiérarchie des titres, des robots par moteur, des identifiants HTML et de la cohérence de l'entreprise.
- Validation structurelle du XML, des pages et images du sitemap, des dates réelles du calendrier et des pages orphelines.
- Ajout d'un contrôle HTTP séparé, en lecture seule, qui traite les URL racine comme diagnostics hors périmètre.
- Fiabilisation IndexNow : git diff ne masque plus les erreurs ; ressources partagées et médias signalent leurs pages affectées ; suppression et sitemap sont conciliés ; clé exacte et URL sont vérifiées ; requêtes bornées dans le temps.
- Workflow IndexNow : historique complet, installation des parseurs, contrôle statique avant soumission, annulation d'un ancien job dépassé par un nouveau commit main, budget de 12 minutes.
- Ajout d'un workflow de contrôle sur les PR vers main : installation, contrôle statique, tests et dry-run uniquement.
- Mise à jour ciblée de source-map-js dans le verrouillage des dépendances.

Les 12 lastmod restent au 28 septembre 2026. Cette date correspond au dernier commit main, qui a modifié les pages. Les changements de cet audit ne modifient aucune page HTML : il n'y a donc aucune raison de remplacer ces dates par le 6 octobre. Les dates doivent refléter les mises à jour réelles des pages. [Recommandation Google sur les sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 6. Fichiers modifiés

Commit technique :

- `.github/workflows/indexnow.yml`
- `.github/workflows/check-site.yml` (nouveau)
- `package.json`
- `package-lock.json`
- `scripts/check-site.mjs`
- `scripts/check-technical.mjs` (nouveau)
- `scripts/site-model.mjs` (nouveau)
- `scripts/check-http.mjs` (nouveau)
- `scripts/technical.test.mjs` (nouveau)
- `scripts/submit-indexnow.mjs`

Livraison documentaire :

- `audit/seo-technique-bing-2026-10-06.md`
- `audit/http-audit.json`
- `audit/inventaire-et-mesures.json`

Le dossier audit est déjà ignoré par .gitignore ; ces trois livrables sont ajoutés explicitement au suivi. Aucun autre fichier ignoré n'est ajouté. Les rapports Lighthouse HTML/JSON et captures sont livrés séparément dans les outputs locaux.

## 7. Tests exécutés

| Vérification | Résultat |
| --- | --- |
| npm ci avant modifications | Installation réussie, 1 vulnérabilité élevée |
| npm run check avant modifications | Contrôle initial réussi pour 12 pages |
| npm ci après modifications | Installation propre réussie, zéro vulnérabilité signalée |
| npm run check après modifications | Contrôles structurels, chemins, sitemap, médias et syntaxe réussis |
| npm test | 25 tests réussis, zéro échec |
| npm run indexnow:dry-run | 12 URL sous le bon préfixe ; aucune requête de soumission |
| npm run check:http -- --output ... | 106 URL PPF HTTP 200 ; zéro échec |
| git diff --check | Réussi |
| Diff HTML/CSS/assets/sitemap/robots par rapport à main | Vide |
| Playwright, 1440 x 1000 et 390 x 844 | 12 pages x 2 tailles ; zéro débordement horizontal, zéro erreur JS |
| axe-core, WCAG A/AA et 2.1 AA | Zéro violation automatique sur les 24 vues |
| Menu mobile et galerie | Focus initial, confinement testé, Échap et retour du focus corrects |
| Formulaire | Champs requis et labels présents ; préparation mailto et focus corrects ; aucun email envoyé |
| Dimensions réelles des images | Aucune différence entre dimensions déclarées et fichiers vérifiés |
| Lighthouse 13.5.0, accueil public | Mobile et ordinateur, configurations vérifiées, aucune alerte d'exécution |

Les tests injectent volontairement des défauts dans une copie temporaire : mauvaise base, mauvaise casse, ressource absente, ancre cassée, poster absent, police absente, canonical dupliquée, JSON-LD invalide, noindex Bing, second H1, date impossible, XML invalide et erreurs de sitemap. Ils vérifient aussi qu'un chemin absolu avec le bon préfixe reste accepté.

Les réponses IndexNow 200, 202 et 403 sont testées avec un réseau simulé. Aucun de ces tests n'envoie de notification réelle.

Les analyses axe demandent une vérification humaine du besoin de sous-titres pour les deux vidéos de l'accueil. Sans examen de leur éventuelle parole, ce point reste une vérification, pas un défaut confirmé. Les contrôles automatiques ne constituent pas une certification complète d'accessibilité.

## 8. Résultats avant/après, performance et GitHub Pages

| Indicateur | Avant | Après sur la branche |
| --- | --- | --- |
| 404 internes PPF observées | 0 | 0, aucune page publiée modifiée |
| Pages éditoriales HTTP 200 | 12/12 | 12/12 |
| Contrôle statique | Liste fixe et couverture partielle | Parseurs, découverte et contrôles supplémentaires |
| Régressions automatisées | Pas de suite dédiée | 25 tests |
| Dépendance vulnérable signalée | 1 | 0 |
| Erreur de plage Git IndexNow | Soumission globale de repli | Échec explicite |
| Historique du workflow IndexNow | 2 commits | Historique complet |
| Budget et délais IndexNow | 8 min, requêtes non bornées | 12 min, requêtes bornées |
| Robots.txt racine | 404 | 404, hors périmètre de modification |
| Design et contenu public | Version validée | Identiques |
| Performance publique | Mesurée ci-dessous | Pas de gain revendiqué : aucune ressource publique modifiée |

Mesures ponctuelles de l'accueil publié, avec Lighthouse 13.5.0 et ralentissement simulé standard pour chaque appareil :

| Mesure | Mobile | Ordinateur |
| --- | --- | --- |
| Performance | 99/100 | 100/100 |
| Accessibilité | 100/100 | 100/100 |
| Bonnes pratiques | 100/100 | 100/100 |
| SEO | 100/100 | 100/100 |
| FCP | 1,111 s | 0,256 s |
| LCP | 1,925 s | 0,474 s |
| TBT | 0 ms | 0 ms |
| CLS | 0,00618 | 0,00585 |

Les configurations `formFactor` et de ralentissement sont enregistrées dans les rapports JSON. Ce sont des mesures de l'accueil, pas de toutes les pages. Aucun INP de terrain ou résultat CrUX n'est disponible dans les preuves collectées. TBT et INP sont différents.

Le CSS fait 19 761 octets ; les quatre scripts actuellement employés totalisent 6 383 octets avant compression et ne sont pas tous chargés sur chaque page. Les trois polices WOFF2 locales totalisent 109 836 octets et utilisent font-display: swap. Le DOM est limité à 277 éléments maximum dans les pages examinées.

Le hero n'est pas lazy, a fetchpriority=high et dispose de WebP responsive. Les autres médias utilisent largement lazy, srcset et sizes. Les vidéos ont des posters, des contrôles et preload=none. Aucune vidéo ne se télécharge automatiquement comme un média de lecture au chargement dans les mesures collectées.

Les réponses GitHub Pages utilisent généralement Cache-Control: max-age=600. Lighthouse propose de prolonger le cache et d'affiner les tailles d'images ; il estime environ 348 KiB d'économies d'images en mobile. Il s'agit d'une estimation, pas d'une économie réalisée. Les photos originales restent intactes. Une correction des sizes doit tenir compte de object-fit, du DPR et du mode photo agrandie, afin de conserver la netteté.

Les deux dernières exécutions main du 28 septembre sont réussies :

- [GitHub Pages, commit 193dd7b](https://github.com/redav42-star/platrerie-peinture-forezienne/actions/runs/36485322544).
- [IndexNow, commit 193dd7b](https://github.com/redav42-star/platrerie-peinture-forezienne/actions/runs/36485323313).

Le journal IndexNow du 28 septembre contient : 12 URL signalées, HTTP 200. Il prouve la réception historique du lot, pas l'indexation des pages. Une clé en sous-répertoire est valide avec keyLocation et couvre ce préfixe. [Documentation IndexNow](https://www.indexnow.org/documentation).

Le workflow Pages intégré est visible et réussi, et le HTML publié correspond à main. La lecture directe des réglages /pages est refusée par les endpoints autorisés du connecteur : le réglage exact de la source de publication dans Settings > Pages n'a donc pas été consulté. Aucun changement de méthode de déploiement n'est proposé.

## 9. Actions restantes dans Bing Webmaster Tools

1. Vérifier la propriété correspondant au site PPF et à son sous-répertoire, par import Search Console ou par la méthode proposée pour cette propriété. Le fichier de vérification Google ne prouve pas une vérification Bing. [Ajouter et vérifier un site](https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b).
2. Soumettre ou vérifier le sitemap exact : https://redav42-star.github.io/platrerie-peinture-forezienne/sitemap.xml. Contrôler sa lecture et le nombre d'URL découvertes. [Sitemaps Bing](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed).
3. Inspecter les 12 canonical, notamment l'accueil, contact, plâtrerie et peinture. Relever séparément découverte, crawl et présence dans l'index, puis les causes d'exclusion éventuelles. [Inspection des URL Bing](https://www.bing.com/webmasters/help/URL-Inspection-55a30305).
4. Consulter les remontées IndexNow, sans interpréter une réponse 200/202 comme une promesse d'indexation.
5. Effectuer les mêmes contrôles de propriété, sitemap et indexation dans Google Search Console.

| État | Ce que l'audit permet d'affirmer |
| --- | --- |
| Accessible | Oui, HTTP 200 pour les 12 pages et les ressources testées |
| Crawlable techniquement | Aucun blocage HTTP ou noindex détecté ; liens et ressources exploitables |
| Soumise | Lot historique IndexNow de 12 URL reçu le 28 septembre ; aucune nouvelle soumission dans cet audit |
| Découverte par Bing/Google | Non vérifiée dans les consoles |
| Indexée par Bing/Google | Non vérifiée dans les consoles |

## 10. Actions restantes dans Ahrefs

1. Exporter les quatre URL 404 du crawl lié à l'email du 30 septembre, avec leur source de découverte, leur statut et la configuration du projet.
2. Vérifier que le projet Site Audit cible **https://redav42-star.github.io/platrerie-peinture-forezienne/** avec un périmètre **URL prefix**, plutôt que https://redav42-star.github.io/ si le seul objectif est PPF.
3. Définir le point de départ sur le véritable accueil et le sitemap PPF. Éviter les sources ou listes d'URL qui réintroduisent la racine hors périmètre.
4. Relancer un crawl après correction du périmètre, puis comparer les URL affectées plutôt que les seuls scores, car un changement de périmètre change aussi la base de calcul.

[Réglages Site Audit Ahrefs](https://help.ahrefs.com/en/articles/9082329-how-should-i-configure-my-site-audit-settings) et [crawl à partir d'un sitemap](https://help.ahrefs.com/en/articles/5372833-how-to-set-site-audit-to-crawl-only-pages-within-a-sitemap).

Aucun projet Ahrefs n'a été modifié ou relancé. L'accès au rapport existant est limité par le plan du connecteur. La recommandation du préfixe PPF est correcte pour l'objectif demandé même si la cause historique des quatre 404 reste à confirmer.

## 11. Risques et limites

Les améliorations sont proposées sur une branche et une Draft PR ; elles ne sont pas encore actives sur main. Le nouveau workflow de PR vérifie le code sans déployer et sans soumettre IndexNow.

Le fichier robots.txt de sous-répertoire ne permet pas de gérer les exclusions du domaine. Une intervention sur le site racine du compte ou une migration réfléchie vers un domaine propre est nécessaire pour disposer d'un robots.txt effectivement applicable. Si un robots racine est établi, les chemins doivent inclure /platrerie-peinture-forezienne/. Cette intervention n'est pas réalisée dans cet audit.

Les contrôles portent sur les pages HTML à la racine, ce qui correspond à l'architecture actuelle. Si des pages imbriquées ou des redirections sont ajoutées, le modèle de découverte et les tests devront être étendus. Le contrôle HTTP compare le HTML publié au checkout ; une différence attendue sur une future branche non publiée sera signalée.

Les mesures HTTP reflètent l'instant de l'audit et les mesures de performance peuvent varier. Une absence de défaut automatique n'élimine pas tout risque d'accessibilité. L'accès aux consoles Bing/Google et à l'export Ahrefs historique reste nécessaire pour les conclusions d'indexation.

Les rapports sont destinés à être suivis dans un dépôt public. Ils ne contiennent ni secret ni clé privée ; la clé IndexNow est volontairement publique. Si la PR est un jour fusionnée, vérifier la politique de publication des documents d'audit dans GitHub Pages.

## 12. Recommandations futures par priorité

### Critique

Aucun blocage critique démontré dans le site PPF. Ne pas créer de faux correctif de 404 et ne pas publier cette branche sans validation du propriétaire.

### Important

- Confirmer les quatre URL Ahrefs et corriger le périmètre si nécessaire.
- Vérifier le sitemap et les statuts d'indexation dans Bing Webmaster Tools et Search Console.
- Choisir une solution pour le robots.txt racine, sans modifier la racine du compte depuis ce dépôt.
- Après validation du propriétaire, intégrer les contrôles et la fiabilisation IndexNow via la PR ; garder les dates lastmod fondées sur les changements de pages.

### Optionnel

- Affiner les sizes avec les dérivés existants et comparer les photos en haute densité avant toute généralisation.
- Mesurer plusieurs chargements et, si le trafic le permet, consulter les données de terrain.
- Envisager un hébergement ou un domaine propre offrant un contrôle des en-têtes de cache, uniquement si le bénéfice justifie cette évolution.
- Examiner le besoin réel de sous-titres ou d'alternatives pour les deux vidéos.
