import "./check-technical.mjs";
import { attr, documentFor, existsExactly, pages, read } from "./site-model.mjs";

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
for (const page of pages) {
  const nodes = documentFor(read(page));
  const meta = (name, value) => nodes.filter((node) => node.tagName === "meta" && attr(node, name) === value);
  const robots = meta("name", "robots");
  check(robots.length === 1 && /\bindex\b/i.test(attr(robots[0] || {}, "content") || ""), `${page}: robots index absent`);
  for (const property of ["og:title", "og:description", "og:image", "og:image:alt"]) {
    check(meta("property", property).length === 1 && attr(meta("property", property)[0] || {}, "content"), `${page}: ${property} absent ou duplique`);
  }
  check(nodes.filter((node) => node.tagName === "script" && attr(node, "type") === "application/ld+json").length === 1, `${page}: JSON-LD absent ou duplique`);
  for (const node of nodes.filter((node) => node.tagName === "img")) {
    check(attr(node, "alt") !== undefined, `${page}: image sans alt`);
    check(/^[1-9]\d*$/.test(attr(node, "width") || "") && /^[1-9]\d*$/.test(attr(node, "height") || ""), `${page}: image sans dimensions`);
  }
  const header = read(page).match(/<header class="site-header">([\s\S]*?)<\/header>/);
  const order = ["brand", "desktop-nav", "header-cta", "menu-toggle"].map((name) => header?.[1].indexOf(`class="${name}"`) ?? -1);
  check(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), `${page}: ordre DOM du header incorrect`);
  if (page !== "index.html") check(read(page).includes('class="breadcrumb container"'), `${page}: fil d'Ariane visible absent`);
}
const siteRoot = "https://redav42-star.github.io/platrerie-peinture-forezienne/";
check(read("robots.txt").split(/\r?\n/).includes(`Sitemap: ${siteRoot}sitemap.xml`), "robots.txt: sitemap incorrect");

const manifest = JSON.parse(read("assets/media/manifest.json"));
for (const group of manifest.groups || []) {
  for (const file of [group.master, ...(group.derivatives || [])]) check(existsExactly(file), `media absent: ${file}`);
  for (const legacy of group.legacy_paths || []) check(!pages.some((page) => read(page).includes(legacy)), `ancienne version referencee: ${legacy}`);
}
const hero = manifest.groups?.find((group) => group.master === "assets/media/accueil/hero-salon.webp");
check(Boolean(hero) && hero.source === "20230922_120855", "manifeste media: master hero ou source historique absent");
if (hero) {
  const legacyPaths = ["assets/chantiers/display/20230922_120855.webp", "assets/chantiers/display/20230922_120855.jpg", "assets/chantiers/web/20230922_120855.jpg", "assets/media/avant-apres/grand-salon-apres.webp"];
  check(legacyPaths.every((path) => hero.legacy_paths?.includes(path)), "manifeste media: chemins historiques incomplets");
  for (const legacy of [hero.source, ...hero.legacy_paths]) check(!pages.some((page) => read(page).includes(legacy)), `ancien master reference: ${legacy}`);
}
const key = "608163cc152a07304fbc7afd2284609f";
check(read(`${key}.txt`).trim() === key, "IndexNow: contenu de cle incorrect");
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Controle statique reussi: ${pages.length} pages, metadonnees, images, medias et cle IndexNow.`);
