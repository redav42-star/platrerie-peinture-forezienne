import { attr, canonicalFor, cssReferences, documentFor, existsExactly, fileForUrl, list, ownUrl, pages, read, references, siteRoot, sitemapEntries, text } from "./site-model.mjs";

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const documents = new Map(pages.map((page) => [page, documentFor(read(page))]));
const titles = new Set();
const descriptions = new Set();
const cssFiles = new Set();
const links = new Map();
let businessReference;

function checkReference(value, base, prefix, anchor = false) {
  try {
    const url = ownUrl(value, base);
    if (!url) return;
    const file = fileForUrl(url);
    check(existsExactly(file), `${prefix} ressource absente ou casse incorrecte: ${file}`);
    if (file.endsWith(".css") && existsExactly(file)) cssFiles.add(file);
    if (anchor && url.hash && documents.has(file)) {
      const id = decodeURIComponent(url.hash.slice(1));
      check(documents.get(file).some((node) => attr(node, "id") === id || (node.tagName === "a" && attr(node, "name") === id)), `${prefix} ancre introuvable: ${file}#${id}`);
    }
    return file;
  } catch (error) { errors.push(`${prefix} ${error.message}`); }
}
for (const [page, nodes] of documents) {
  const prefix = `${page}:`;
  const canonical = canonicalFor(page);
  const meta = (name, value) => nodes.filter((node) => node.tagName === "meta" && attr(node, name) === value);
  const titleNodes = nodes.filter((node) => node.tagName === "title");
  const title = titleNodes.map(text).join("").trim();
  check(titleNodes.length === 1 && title && !titles.has(title), `${prefix} title absent, duplique ou non unique`);
  titles.add(title);
  const descriptionNodes = meta("name", "description");
  const description = attr(descriptionNodes[0] || {}, "content")?.trim();
  check(descriptionNodes.length === 1 && description && !descriptions.has(description), `${prefix} description absente, dupliquee ou non unique`);
  descriptions.add(description);
  check(nodes.filter((node) => node.tagName === "h1").length === 1, `${prefix} nombre de H1 incorrect`);
  let headingLevel = 0;
  for (const node of nodes.filter((node) => /^h[1-6]$/.test(node.tagName))) {
    const level = Number(node.tagName[1]);
    check(level <= headingLevel + 1, `${prefix} saut de niveau de titre: ${node.tagName}`);
    headingLevel = level;
  }
  check(!nodes.some((node) => node.tagName === "meta" && /^(?:robots|googlebot|bingbot)$/i.test(attr(node, "name") || "") && /\b(?:noindex|nofollow|none)\b/i.test(attr(node, "content") || "")), `${prefix} restriction robots accidentelle`);
  const canonicals = nodes.filter((node) => node.tagName === "link" && (attr(node, "rel") || "").split(/\s+/).includes("canonical"));
  check(canonicals.length === 1 && attr(canonicals[0] || {}, "href") === canonical, `${prefix} canonical incorrecte`);
  check(meta("property", "og:url").length === 1 && attr(meta("property", "og:url")[0] || {}, "content") === canonical, `${prefix} og:url incorrecte`);
  for (const node of nodes.filter((node) => node.tagName === "script" && attr(node, "type") === "application/ld+json")) {
    try {
      const schema = JSON.parse(text(node));
      const graph = list(schema["@graph"]);
      const business = graph.find((entry) => entry["@type"] === "HomeAndConstructionBusiness");
      check(Boolean(business), `${prefix} entreprise absente du JSON-LD`);
      if (business) {
        businessReference ??= JSON.stringify(business);
        check(JSON.stringify(business) === businessReference, `${prefix} coordonnees ou zone entreprise incoherentes`);
      }
      if (page !== "index.html") check(graph.find((entry) => entry["@type"] === "BreadcrumbList")?.itemListElement?.at(-1)?.item === canonical, `${prefix} BreadcrumbList incorrect`);
      const walk = (value) => {
        if (typeof value === "string" && /^https?:\/\//.test(value)) checkReference(value, canonical, `${prefix} JSON-LD:`);
        else if (value && typeof value === "object") Object.values(value).forEach(walk);
      };
      walk(schema);
    } catch (error) { errors.push(`${prefix} JSON-LD invalide (${error.message})`); }
  }
  const targets = new Set();
  for (const { value, node, name } of references(nodes)) {
    const file = checkReference(value, canonical, prefix, node.tagName === "a" && name === "href");
    if (node.tagName === "a" && name === "href" && documents.has(file)) targets.add(file);
  }
  links.set(page, targets);
  const ids = nodes.map((node) => attr(node, "id")).filter(Boolean);
  check(new Set(ids).size === ids.length, `${prefix} id duplique`);
}
for (const file of cssFiles) for (const ref of cssReferences(file)) checkReference(ref.value, ref.base, `${file}:`);
try {
  const entries = sitemapEntries();
  const urls = entries.map((entry) => entry.loc);
  check(new Set(urls).size === urls.length && urls.length === pages.length, "sitemap: nombre ou unicite d'URL incorrect");
  for (const page of pages) check(urls.includes(canonicalFor(page)), `sitemap: page publique absente: ${page}`);
  for (const entry of entries) {
    const file = checkReference(entry.loc, siteRoot, "sitemap:");
    check(pages.includes(file) && entry.loc === canonicalFor(file), `sitemap: URL non canonique ou non publique: ${entry.loc}`);
    const date = entry.lastmod;
    check(typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date && date <= new Date().toISOString().slice(0, 10), `sitemap: lastmod invalide ou futur: ${date}`);
    for (const image of list(entry["image:image"])) checkReference(image["image:loc"], siteRoot, "sitemap image:");
  }
} catch (error) { errors.push(error.message); }
const reached = new Set(["index.html"]);
const queue = ["index.html"];
for (const page of queue) for (const target of links.get(page) || []) if (!reached.has(target)) { reached.add(target); queue.push(target); }
for (const page of pages) check(reached.has(page), `page orpheline depuis l'accueil: ${page}`);
if (errors.length) {
  console.error(`Echec du controle technique (${errors.length}):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}
console.log(`Controle technique reussi: ${pages.length} pages, chemins et casse, ancres, CSS, sitemap, JSON-LD et maillage.`);
