# Recette visuelle et fonctionnelle PPF — 8 septembre 2026

**Résultat : passed — périmètre local vérifié. Publication : blocked.**

La comparaison de direction artistique utilise, dans une même image, le concept A « Atelier lumière » et le premier écran réellement implémenté : `audit/comparaison-concept-site.jpg` dans le dossier de livraison. Référence : `generated_images/exec-1ffeab2a-755d-41fa-a81f-8b3431cf0350.png`. Capture finale : `audit/accueil-final.jpg`. La référence est un concept de composition ; seule la photographie réelle du chantier est utilisée dans le site.

## Cinq surfaces comparées

| Surface | Résultat et arbitrage |
|---|---|
| Composition | Deux colonnes sur ordinateur, hiérarchie métier/zone/bénéfice, photo de résultat dominante. Empilement mobile avec photographie visible dès le premier écran. |
| Typographie | Playfair Display pour les titres et Inter pour le texte ; polices locales. H1 métier/local plus explicite que le slogan du concept. |
| Couleurs | Ivoire, vert profond, texte sombre et séparateurs sobres conformes à la direction retenue. |
| Images et identité | Logo réel conservé ; photo réelle sans bâche. Aucun rendu généré de pièce ne devient une preuve de chantier. |
| Composants et densité | Navigation lisible, boutons Devis/Appeler, cartes de prestations sobres, absence de décoration qui retarderait la compréhension. |

## Conditions et itérations

Chrome, fenêtre CSS 1363 × 936 ; capture utile environ 1348 × 926, densité proche de 1. Concept redimensionné proportionnellement à la même largeur dans la planche commune. Contrôles à 360, 390, 760, 1024 et 1280 px via cadre de test CSS, sans émulation de téléphone. Les hauteurs et défilements ont été inspectés visuellement ; ces contrôles ne valent pas une recette sur appareils physiques.

Corrections effectuées après inspection : ordre réel logo/navigation/devis/menu ; raccourcissement de l’introduction mobile et cadrage de la cheminée ; conservation de Saint-Étienne sur une même ligne lorsque nécessaire ; déplacement des preuves après le premier titre sur Professionnels et Dégâts des eaux ; reclassement du couloir en PENDANT, ses habillages restant ouverts. Cette dernière légende a été vérifiée dans le code après inspection de la photographie. La retouche altérant le radiateur a été rejetée.

Certaines captures pleine page omettent le rendu des images hors écran : elles servent seulement à la structure. Les photographies importantes ont été contrôlées dans des captures de la zone visible. Les captures antérieures aux corrections ne constituent pas la preuve finale.

## Interactions exercées

- Menu mobile : ouverture, fermeture, boucle Tab et Maj+Tab, Échap et restitution du focus.
- Comparateur : sélection de l’état, visibilité et aria-pressed ; angles différents explicités.
- Galerie : ouverture, image suivante, fermeture Échap et retour du focus.
- Devis : champs obligatoires bloquants ; préparation d’un mailto correctement encodé ; copie avec confirmation. Aucun message envoyé. Le site dit explicitement que le message n’est pas encore envoyé.
- Parcours salon : prestation peinture/préparation → réalisation → contact. Parcours bailleur : professionnels → rénovation → preuve → devis. Parcours sinistre : guide → prestation → contact ; pas d’étude de sinistre inventée.

## Contrôles techniques et limites

Le contrôle statique réussit sur 12 pages : liens et ancres internes, médias, canonicals, métadonnées, données structurées, sitemap et registre des masters. La vérification indépendante a confirmé les dimensions des 57 occurrences d’images, les largeurs de 63 candidats srcset et un H1 par page. Sept scripts passent la vérification syntaxique Node. Le diff ne contient pas d’erreur d’espacement.

Aucune erreur de script PPF n’a été relevée dans la fenêtre de console observée ; un message propre à l’extension du navigateur était présent. Les deux vidéos H.264 de neuf secondes sont muettes, accompagnées de texte et de commandes, sans lecture automatique.

Firefox, WebKit, téléphone physique, réseau dégradé et audit d’accessibilité exhaustif non exécutés. L’API PageSpeed a répondu 429 : aucun score Lighthouse ni résultat Core Web Vitals n’est attribué à cette version. IndexNow a seulement été simulé. La publication GitHub a été refusée par le contrôle automatique d’autorisation et nécessite l’accord explicite du propriétaire avant reprise.
