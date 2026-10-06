import { readdirSync, writeFileSync } from "node:fs";
import { attr, canonicalFor, cssReferences, documentFor, list, ownUrl, pages, read, references, siteRoot, siteUrl, sitemapEntries, text } from "./site-model.mjs";

const urls = new Set([`${siteRoot}robots.txt`, `${siteRoot}sitemap.xml`, `${siteRoot}608163cc152a07304fbc7afd2284609f.txt`]);
const cssFiles = new Set();
for (const file of readdirSync(".").filter((file) => /^google[a-f0-9]+\.html$/.test(file))) urls.add(new URL(file, siteRoot).href);
function add(value, base = siteRoot) {
  const url = ownUrl(value, base);
  if (url) { url.hash = ""; urls.add(url.href); if (url.pathname.endsWith(".css")) cssFiles.add(url.pathname.slice(siteUrl.pathname.length)); }
}
for (const page of pages) {
  const canonical = canonicalFor(page);
  add(canonical);
  const nodes = documentFor(read(page));
  for (const ref of references(nodes)) add(ref.value, canonical);
  const walk = (value) => {
    if (typeof value === "string" && /^https?:\/\//.test(value)) add(value, canonical);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  for (const node of nodes.filter((node) => node.tagName === "script" && attr(node, "type") === "application/ld+json")) walk(JSON.parse(text(node)));
}
for (const css of cssFiles) for (const ref of cssReferences(css)) add(ref.value, ref.base);
for (const entry of sitemapEntries()) {
  add(entry.loc);
  for (const image of list(entry["image:image"])) add(image["image:loc"]);
}
const targets = [...urls];
const results = [];
let cursor = 0;
async function inspect(url, diagnostic = false) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    const contentType = response.headers.get("content-type") || "";
    const body = /html|xml|text\/plain/.test(contentType) ? await response.text() : null;
    if (body === null) await response.body?.cancel();
    const errors = [];
    if (!diagnostic && (response.status !== 200 || response.url !== url)) errors.push("Statut ou redirection inattendu");
    if (!diagnostic && /\bnoindex\b/i.test(response.headers.get("x-robots-tag") || "")) errors.push("X-Robots-Tag noindex");
    const page = pages.find((page) => canonicalFor(page) === url);
    if (page && response.status === 200) {
      const nodes = documentFor(body);
      const canonical = nodes.filter((node) => node.tagName === "link" && attr(node, "rel") === "canonical");
      if (canonical.length !== 1 || attr(canonical[0], "href") !== url) errors.push("Canonical publiee incorrecte");
      if (nodes.some((node) => node.tagName === "meta" && /^(robots|googlebot|bingbot)$/i.test(attr(node, "name") || "") && /\b(noindex|none)\b/i.test(attr(node, "content") || ""))) errors.push("Meta noindex publiee");
      if (body.replaceAll("\r\n", "\n") !== read(page).replaceAll("\r\n", "\n")) errors.push("HTML publie different du checkout (branche non deployee possible)");
    }
    if (url.endsWith("608163cc152a07304fbc7afd2284609f.txt") && body?.trim() !== "608163cc152a07304fbc7afd2284609f") errors.push("Cle publiee incorrecte");
    if (!diagnostic && (url.endsWith("sitemap.xml") || url.endsWith("robots.txt")) && body?.replaceAll("\r\n", "\n") !== read(url.endsWith("sitemap.xml") ? "sitemap.xml" : "robots.txt").replaceAll("\r\n", "\n")) errors.push("Fichier publie different du checkout");
    return { url, diagnostic, status: response.status, finalUrl: response.url, cacheControl: response.headers.get("cache-control"), errors };
  } catch (error) { return { url, diagnostic, errors: [error.message] }; }
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < targets.length) results.push(await inspect(targets[cursor++]));
}));
for (const url of [siteUrl.origin + "/", siteUrl.origin + "/robots.txt"]) results.push(await inspect(url, true));
results.sort((a, b) => a.url.localeCompare(b.url));
const failures = results.filter((result) => !result.diagnostic && result.errors.length);
const report = { observedAt: new Date().toISOString(), siteRoot, checked: targets.length, failures: failures.length, results };
const outputIndex = process.argv.indexOf("--output");
if (outputIndex !== -1) {
  if (!process.argv[outputIndex + 1]) throw new Error("Chemin --output manquant");
  writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + "\n");
}
console.log(`HTTP: ${targets.length} URL PPF, ${failures.length} echec(s). Les URL racine sont des diagnostics hors perimetre.`);
for (const result of results.filter((result) => result.diagnostic || result.errors.length)) console.log(JSON.stringify(result));
if (failures.length) process.exitCode = 1;
