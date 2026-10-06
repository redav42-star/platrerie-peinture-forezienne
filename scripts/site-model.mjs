import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "parse5";
import { XMLParser, XMLValidator } from "fast-xml-parser";

export const siteRoot = "https://redav42-star.github.io/platrerie-peinture-forezienne/";
export const siteUrl = new URL(siteRoot);
export const pages = readdirSync(".").filter((file) => file.endsWith(".html") && !/^google[a-f0-9]+\.html$/.test(file));
export const canonicalFor = (page) => new URL(page === "index.html" ? "" : page, siteRoot).href;
export const read = (file) => readFileSync(file, "utf8");
export const list = (value) => value === undefined ? [] : Array.isArray(value) ? value : [value];

export function documentFor(html) {
  const nodes = [];
  const visit = (node) => {
    if (node.tagName) nodes.push(node);
    for (const child of node.childNodes || []) visit(child);
  };
  visit(parse(html));
  return nodes;
}
export const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
export const text = (node) => node.nodeName === "#text" ? node.value : (node.childNodes || []).map(text).join("");

export function references(nodes) {
  return nodes.flatMap((node) => {
    const refs = ["href", "src", "poster"].flatMap((name) => attr(node, name) === undefined ? [] : [{ value: attr(node, name), node, name }]);
    for (const entry of (attr(node, "srcset") || "").split(",").filter(Boolean)) refs.push({ value: entry.trim().split(/\s+/)[0], node, name: "srcset" });
    if (node.tagName === "meta" && /^(?:og:(?:url|image)|twitter:image)$/.test(attr(node, "property") || attr(node, "name") || "")) refs.push({ value: attr(node, "content"), node, name: "content" });
    return refs;
  });
}
export function ownUrl(value, base = siteRoot) {
  const url = new URL(value, base);
  if (url.hostname !== siteUrl.hostname) return null;
  if (url.origin !== siteUrl.origin || !url.pathname.startsWith(siteUrl.pathname)) throw new Error(`URL hors de la base GitHub Pages: ${url.href}`);
  return url;
}
export function fileForUrl(url) {
  let file = decodeURIComponent(url.pathname.slice(siteUrl.pathname.length));
  if (!file || file.endsWith("/")) file += "index.html";
  return file;
}
export function existsExactly(file) {
  let directory = ".";
  for (const part of file.split("/")) {
    if (!part || part === "." || part === "..") return false;
    try { if (!readdirSync(directory).includes(part)) return false; } catch { return false; }
    directory = join(directory, part);
  }
  return true;
}
export function sitemapEntries() {
  const xml = read("sitemap.xml");
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error(`sitemap XML invalide: ${validation.err.msg}`);
  const parsed = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(xml);
  if (parsed.urlset?.["@_xmlns"] !== "http://www.sitemaps.org/schemas/sitemap/0.9") throw new Error("sitemap: espace de noms invalide");
  return list(parsed.urlset.url);
}
export function cssReferences(file) {
  return [...read(file).matchAll(/url\(\s*["']?([^\)"']+)["']?\s*\)/g)].map((match) => ({ value: match[1].trim(), base: new URL(file, siteRoot).href }));
}
