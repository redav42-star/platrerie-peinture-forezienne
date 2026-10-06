import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { canonicalFor, pages, siteRoot } from "./site-model.mjs";
import { readSitemapUrls, urlsToSubmit } from "./submit-indexnow.mjs";

const root = resolve(".");
const fixture = mkdtempSync(join(tmpdir(), "ppf-technical-"));
for (const file of readdirSync(root).filter((file) => file.endsWith(".html") || ["robots.txt", "sitemap.xml", "styles.css", "608163cc152a07304fbc7afd2284609f.txt"].includes(file))) cpSync(join(root, file), join(fixture, file));
cpSync(join(root, "assets"), join(fixture, "assets"), { recursive: true });
after(() => {
  assert.ok(resolve(fixture).startsWith(resolve(tmpdir()) + sep) && basename(fixture).startsWith("ppf-technical-"));
  rmSync(fixture, { recursive: true, force: true });
});
const runCheck = () => spawnSync(process.execPath, [join(root, "scripts/check-site.mjs")], { cwd: fixture, encoding: "utf8" });
function mutation(name, file, change, expected) {
  test(name, () => {
    const path = join(fixture, file);
    const original = existsSync(path) ? readFileSync(path, "utf8") : null;
    try {
      const mutated = change(original);
      assert.notEqual(mutated, original);
      writeFileSync(path, mutated);
      const result = runCheck();
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stderr, expected);
    } finally {
      if (original === null) rmSync(path);
      else writeFileSync(path, original);
    }
  });
}
test("le site actuel passe", () => { const result = runCheck(); assert.equal(result.status, 0, result.stderr); });
mutation("lien vers la racine GitHub Pages", "index.html", (s) => s.replace('href="contact.html"', 'href="https://redav42-star.github.io/contact.html"'), /hors de la base/);
mutation("ressource avec mauvaise casse sous Windows", "index.html", (s) => s.replace('href="assets/favicon.png"', 'href="assets/Favicon.png"'), /casse incorrecte/);
mutation("lien relatif inexistant", "index.html", (s) => s.replace('href="contact.html"', 'href="inexistante.html"'), /ressource absente/);
mutation("ancre vers une autre page", "index.html", (s) => s.replace('href="contact.html"', 'href="contact.html#absente"'), /ancre introuvable/);
mutation("poster video absent", "index.html", (s) => s.replace('poster="assets/media/videos/application-airless-poster.webp"', 'poster="assets/media/videos/inexistant.webp"'), /ressource absente/);
mutation("police CSS absente", "assets/fonts/fonts.css", (s) => s.replace('inter-latin.woff2', 'inexistante.woff2'), /ressource absente/);
mutation("canonical dupliquee", "index.html", (s) => s.replace('</head>', `<link rel="canonical" href="${siteRoot}"></head>`), /canonical incorrecte/);
mutation("JSON-LD invalide", "index.html", (s) => s.replace('{"@context"', '{invalid "@context"'), /JSON-LD invalide/);
mutation("noindex Bing accidentel", "index.html", (s) => s.replace('</head>', '<meta name="bingbot" content="noindex"></head>'), /restriction robots/);
mutation("deux H1", "index.html", (s) => s.replace('</main>', '<h1>Test</h1></main>'), /H1 incorrect/);
mutation("date calendrier invalide", "sitemap.xml", (s) => s.replace('2026-09-28', '2026-02-30'), /lastmod invalide/);
mutation("XML invalide", "sitemap.xml", (s) => s.replace('</urlset>', '</incorrect>'), /XML invalide/);
mutation("image sitemap absente", "sitemap.xml", (s) => s.replace('assets/media/accueil/hero-salon.webp', 'assets/media/accueil/absente.webp'), /ressource absente/);
mutation("page sitemap inexistante", "sitemap.xml", (s) => s.replace('contact.html</loc>', 'absente.html</loc>'), /page publique absente|non publique/);
mutation("nouvelle page oubliee du sitemap", "nouvelle.html", () => readFileSync(join(root, "contact.html"), "utf8"), /sitemap: page publique absente: nouvelle.html/);
test("chemin absolu avec le bon prefixe accepte", () => {
  const file = join(fixture, "index.html"), original = readFileSync(file, "utf8");
  try { writeFileSync(file, original.replaceAll('href="contact.html"', 'href="/platrerie-peinture-forezienne/contact.html"')); const result = runCheck(); assert.equal(result.status, 0, result.stderr); }
  finally { writeFileSync(file, original); }
});
test("IndexNow: aucune modification", () => assert.deepEqual(urlsToSubmit([]), []));
test("IndexNow: URL HTML et suppression, sans verification Google", () => assert.deepEqual(urlsToSubmit(["contact.html", "ancienne.html", "googledc9bb4fdc88e0307.html"]), [canonicalFor("contact.html"), canonicalFor("ancienne.html")]));
test("IndexNow: medias et code partages", () => {
  assert.deepEqual(new Set(urlsToSubmit(["styles.css"])), new Set(readSitemapUrls()));
  const affected = urlsToSubmit(["assets/media/accueil/hero-salon.webp"]);
  assert.ok(affected.includes(siteRoot));
  assert.ok(affected.length <= pages.length);
});
test("IndexNow: sitemap modifie conserve les notifications de suppression", () => {
  assert.deepEqual(new Set(urlsToSubmit(["sitemap.xml", "ancienne.html"])), new Set([...readSitemapUrls(), canonicalFor("ancienne.html")]));
});
test("IndexNow: plage Git invalide echoue sans soumission globale", () => {
  const result = spawnSync(process.execPath, ["scripts/submit-indexnow.mjs", "commit-inexistant", "HEAD", "--dry-run"], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Impossible de lire les commits/);
  assert.ok(!result.stdout.includes('"urlList"'));
});
for (const status of [200, 202, 403]) test(`IndexNow: reponse ${status} avec reseau simule`, () => {
  const mock = `globalThis.fetch=async(url,options)=>{if(url.endsWith('.txt'))return new Response('608163cc152a07304fbc7afd2284609f');if(url!=='https://api.indexnow.org/indexnow')throw Error('Endpoint inattendu');const payload=JSON.parse(options.body);if(payload.host!=='redav42-star.github.io'||!payload.keyLocation.startsWith('${siteRoot}')||payload.urlList.length!==12||payload.urlList.some(url=>!url.startsWith('${siteRoot}')))throw Error('Payload incorrect');return new Response('test',{status:${status}})};`;
  const result = spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(mock)}`, "scripts/submit-indexnow.mjs", "0000000000000000000000000000000000000000", "HEAD"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, status === 403 ? 1 : 0, result.stderr);
  assert.match(result.stdout + result.stderr, status === 403 ? /refuse la soumission \(403\)/ : new RegExp(`12 URL signalee\\(s\\).*${status}`));
});
