# Contrôle de l’indexation Google — 14 août 2026

Site contrôlé : <https://redav42-star.github.io/platrerie-peinture-forezienne/>

Source Google utilisée : Inspection de l’URL dans Google Search Console, propriété de type « Préfixe de l’URL » validée le 14 août 2026.

## Résultat par URL

| URL | HTTP | Meta robots | Robots.txt | Canonical | Sitemap | Search Console | Action réalisée | État final |
|---|---:|---|---|---|---:|---|---|---|
| <https://redav42-star.github.io/platrerie-peinture-forezienne/> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/platrerie.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/bandes-a-joints-jointeur.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/peinture-airless.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/ratissage-enduits.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/cloisons-faux-plafonds.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/renovation-appartement.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/chantier-renovation-appartement-saint-etienne-2023.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | Non indexée : « Google ne reconnaît pas cette URL ». Test en direct : « Google a accès à cette URL » et « La page peut être indexée » | Une demande d’indexation envoyée ; confirmation « Indexation demandée », ajout à la file d’exploration prioritaire | `INDEXING_REQUESTED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/degats-des-eaux.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/quand-repeindre-apres-degat-des-eaux.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/professionnels.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |
| <https://redav42-star.github.io/platrerie-peinture-forezienne/contact.html> | 200 | `index,follow` | Autorisée | Auto-référente | 1× | « Cette URL est sur Google » ; page indexée | Aucune demande | `INDEXED` |

## Contrôles techniques complémentaires

- Les 12 URL du sitemap répondent directement en HTTP 200, sans redirection inattendue ni en-tête `X-Robots-Tag: noindex`.
- Chaque page possède un title, une meta description, exactement un H1 et un contenu substantiel distinct.
- Aucun lien interne ou média majeur cassé n’a été trouvé ; aucune erreur JavaScript bloquante ni aucun débordement horizontal n’a été observé lors du contrôle mobile des 12 pages.
- Aucune page du sitemap n’est orpheline. La fiche chantier 2023 reçoit deux liens internes naturels.
- La fiche chantier 2023 présente huit photos de chantier, toutes accessibles en HTTP 200.
- Aucun doublon d’URL, fichier privé, rapport, script ou asset n’est présent dans le sitemap.

## Résumé

```text
TOTAL_URLS = 12
INDEXED = 11
INDEXING_REQUESTED = 1
PENDING = 0
BLOCKED = 0
TECHNICAL_ERRORS = 0
```

## Sitemap

```text
SUBMITTED = YES — nouvel envoi effectué le 14 août 2026
STATUS = REPROCESSING_PENDING — Search Console affiche encore « Impossible de récupérer/lire le sitemap », 0 page découverte
URL_COUNT = 12
```

Le sitemap public a été contrôlé séparément après l’envoi : HTTP 200, type `application/xml`, XML lisible, 12 URL uniques et 12 dates `lastmod` au 14 août 2026. L’état négatif de Search Console n’est donc pas accompagné d’une erreur technique reproductible sur le fichier public ; il doit être recontrôlé après le retraitement de Google. Aucun nouvel envoi multiple n’a été effectué.

## Modifications Git éventuelles

- Fichier ajouté pendant cette mission : `reports/google_indexation_status_latest.md`.
- Aucun texte, design, balisage ou fichier fonctionnel du site n’a été modifié : les 12 pages étaient techniquement prêtes.
- Commit de référence audité avant publication du rapport : `1d0477fdd2f88d54de8d9e51b1f693fd7644fb8d` sur `main`.
- Push du rapport : prévu sur `main` après validation de ce document.
- GitHub Pages : le site public audité sert correctement les pages, robots.txt et sitemap.xml. Le rapport est exclu de l’exploration par robots.txt (`Disallow: /reports/`).

## Action manuelle restante

Aucune action manuelle immédiate. Google doit maintenant traiter la demande unique d’indexation de la fiche chantier 2023 et retraiter le sitemap nouvellement soumis.

## Verdict final

`INDEXATION_REQUESTS_PENDING`


