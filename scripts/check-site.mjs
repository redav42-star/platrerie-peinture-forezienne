import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const siteRoot = "https://redav42-star.github.io/platrerie-peinture-forezienne/";
const pages = [
  "index.html",
  "platrerie.html",
  "bandes-a-joints-jointeur.html",
  "peinture-airless.html",
  "ratissage-enduits.html",
  "cloisons-faux-plafonds.html",
  "renovation-appartement.html",
  "chantier-renovation-appartement-saint-etienne-2023.html",
  "degats-des-eaux.html",
  "quand-repeindre-apres-degat-des-eaux.html",
  "professionnels.html",
  "contact.html",
];
const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};
const read = (file) => readFileSync(file, "utf8");
const canonicalFor = (page) => (page === "index.html" ? siteRoot : `${siteRoot}${page}`);
const isOwnAbsoluteUrl = (value) => value.startsWith(siteRoot);
const localPath = (value) => {
  const withoutFragment = value.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment || withoutFragment === "./") return null;
  if (isOwnAbsoluteUrl(withoutFragment)) return withoutFragment.slice(siteRoot.length);
  if (/^(?:[a-z]+:|\/\/)/i.test(withoutFragment)) return null;
  return withoutFragment;
};
const attributes = (tag) => [...tag.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
const srcsetValues = (tag) => [...tag.matchAll(/\bsrcset="([^"]+)"/g)]
  .flatMap((match) => match[1].split(",").map((entry) => entry.trim().split(/\s+/, 1)[0]));
const tags = (html) => html.match(/<(?:a|img|source|script|link)\b[^>]*>/g) || [];

for (const page of pages) {
  const html = read(page);
  const prefix = `${page}:`;

  check((html.match(/<title>[^<]+<\/title>/g) || []).length === 1, `${prefix} title absent ou dupliqué`);
  check((html.match(/<meta\b[^>]*\bname="description"[^>]*>/g) || []).length === 1, `${prefix} meta description absente ou dupliquée`);
  check(html.includes('<meta content="index,follow" name="robots"'), `${prefix} robots index,follow absent`);
  check(html.includes(`<link href="${canonicalFor(page)}" rel="canonical"`), `${prefix} canonical incorrecte`);
  check(html.includes(`<meta content="${canonicalFor(page)}" property="og:url"`), `${prefix} og:url incorrecte`);
  check(html.includes('property="og:image"') && html.includes('assets/media/accueil/hero-salon.jpg'), `${prefix} og:image master absent`);

  const schemaBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  check(schemaBlocks.length === 1, `${prefix} bloc JSON-LD absent ou dupliqué`);
  if (schemaBlocks.length === 1) {
    try {
      const schema = JSON.parse(schemaBlocks[0]);
      const graph = schema["@graph"] || [];
      check(graph.some((entry) => entry["@type"] === "HomeAndConstructionBusiness"), `${prefix} entité entreprise absente du JSON-LD`);
      if (page !== "index.html") check(graph.some((entry) => entry["@type"] === "BreadcrumbList"), `${prefix} BreadcrumbList absent du JSON-LD`);
    } catch (error) {
      errors.push(`${prefix} JSON-LD invalide (${error.message})`);
    }
  }
  if (page !== "index.html") check(html.includes('class="breadcrumb container"'), `${prefix} fil d’Ariane visible absent`);

  const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/);
  check(Boolean(header), `${prefix} header absent`);
  if (header) {
    const headerHtml = header[1];
    const order = ["class=\"brand\"", "class=\"desktop-nav\"", "class=\"header-cta\"", "class=\"menu-toggle\""]
      .map((needle) => headerHtml.indexOf(needle));
    check(order.every((position) => position >= 0) && order.every((position, index) => index === 0 || position > order[index - 1]), `${prefix} ordre DOM du header incorrect`);
  }

  for (const tag of tags(html)) {
    for (const value of [...attributes(tag), ...srcsetValues(tag)]) {
      const path = localPath(value);
      if (path) check(existsSync(resolve(path)), `${prefix} ressource locale introuvable: ${path}`);
    }
    if (tag.startsWith("<img")) {
      check(/\balt="[^"]*"/.test(tag), `${prefix} image sans alt`);
      check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${prefix} image sans dimensions`);
    }
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="#([^"]+)"[^>]*>/g)) {
    check(new RegExp(`\\bid="${match[1]}"`).test(html), `${prefix} ancre interne introuvable: #${match[1]}`);
  }
}

const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(sitemapUrls.length === pages.length, "sitemap: nombre d’URL inattendu");
check(new Set(sitemapUrls).size === sitemapUrls.length, "sitemap: URL dupliquée");
check(pages.every((page) => sitemapUrls.includes(canonicalFor(page))), "sitemap: page publique absente");
const sitemapLastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
check(sitemapLastmods.length === pages.length && sitemapLastmods.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= new Date().toISOString().slice(0,10)), "sitemap: lastmod absent, invalide ou futur");
check(read("robots.txt").includes(`Sitemap: ${siteRoot}sitemap.xml`), "robots.txt: sitemap absente");

const mediaManifest = JSON.parse(read("assets/media/manifest.json"));
for (const group of mediaManifest.groups || []) {
  check(existsSync(resolve(group.master)), `master absent: ${group.master}`);
  for (const path of group.derivatives || []) check(existsSync(resolve(path)), `dérivé absent: ${path}`);
  for (const legacy of group.legacy_paths || []) {
    check(!pages.map(read).some(html => html.includes(legacy)), `ancienne version référencée: ${legacy}`);
  }
}
const mediaGroup = mediaManifest.groups?.find((group) => group.master === "assets/media/accueil/hero-salon.webp");
check(Boolean(mediaGroup), "manifeste média: master hero-salon absent");
if (mediaGroup) {
  check(mediaGroup.source === "20230922_120855", "manifeste média: source historique absente");
  const expectedLegacyPaths = [
    "assets/chantiers/display/20230922_120855.webp",
    "assets/chantiers/display/20230922_120855.jpg",
    "assets/chantiers/web/20230922_120855.jpg",
    "assets/media/avant-apres/grand-salon-apres.webp",
  ];
  check(expectedLegacyPaths.every((path) => mediaGroup.legacy_paths?.includes(path)), "manifeste média: chemins historiques incomplets");
  for (const legacy of [mediaGroup.source, ...mediaGroup.legacy_paths]) {
    check(!pages.map(read).some((content) => content.includes(legacy)), `ancien master encore référencé par une page publique: ${legacy}`);
  }
}

const key = read("608163cc152a07304fbc7afd2284609f.txt").trim();
check(/^[a-f0-9]{32}$/.test(key), "IndexNow: clé invalide");

if (errors.length) {
  console.error(`Échec du contrôle statique (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Contrôle statique réussi : ${pages.length} pages, sitemap, médias, JSON-LD et IndexNow.`);
