import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { canonicalFor, documentFor, fileForUrl, ownUrl, pages, references, sitemapEntries } from "./site-model.mjs";

const host = "redav42-star.github.io";
const siteRoot = `https://${host}/platrerie-peinture-forezienne/`;
const key = "608163cc152a07304fbc7afd2284609f";
const keyLocation = `${siteRoot}${key}.txt`;
const argumentsWithoutFlags = process.argv.slice(2).filter((argument) => argument !== "--dry-run");
const before = argumentsWithoutFlags[0];
const after = argumentsWithoutFlags[1] || "HEAD";
const dryRun = process.argv.includes("--dry-run");

export function readSitemapUrls() {
  const urls = sitemapEntries().map((entry) => entry.loc);
  if (!urls.length || new Set(urls).size !== urls.length) throw new Error("Sitemap vide ou duplique.");
  for (const url of urls) {
    const own = ownUrl(url);
    if (!own || !pages.includes(fileForUrl(own)) || canonicalFor(fileForUrl(own)) !== url) throw new Error(`URL sitemap non publique ou non canonique: ${url}`);
  }
  return urls;
}

function changedFiles() {
  if (!before || /^0+$/.test(before)) return ["sitemap.xml"];

  try {
    return execFileSync("git", ["diff", "--name-only", "--no-renames", before, after, "--"], {
      encoding: "utf8",
    })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch (error) {
    throw new Error(`Impossible de lire les commits IndexNow: ${error.message}`);
  }
}

export function urlsToSubmit(files) {
  const urls = files.includes("sitemap.xml") ? readSitemapUrls() : [];
  urls.push(...files.flatMap((file) => {
    if (file === "index.html") return [siteRoot];
    if (/^[^/]+\.html$/.test(file) && !/^google[a-f0-9]+\.html$/.test(file)) return [`${siteRoot}${file}`];
    return [];
  }));

  // Shared code and fonts affect every page; media changes affect their referring pages.
  if (files.some((file) => file.endsWith(".css") || file.startsWith("assets/js/") || file.startsWith("assets/fonts/"))) urls.push(...readSitemapUrls());
  else for (const page of pages) {
    const mediaFiles = files.filter((file) => file.startsWith("assets/"));
    const refs = references(documentFor(readFileSync(page, "utf8")));
    if (refs.some(({ value }) => {
      const url = ownUrl(value, canonicalFor(page));
      return url && mediaFiles.includes(fileForUrl(url));
    })) urls.push(canonicalFor(page));
  }
  const unique = [...new Set(urls)];
  for (const url of unique) if (!ownUrl(url)) throw new Error(`URL IndexNow externe: ${url}`);
  return unique;
}

async function waitForPublishedKey() {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(keyLocation, {
        headers: { "cache-control": "no-cache" },
        signal: AbortSignal.timeout(10_000),
      });
      const body = (await response.text()).trim();
      if (response.ok && body === key) return;
    } catch {
      // GitHub Pages may still be publishing. Retry below.
    }

    if (attempt < 12) await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  throw new Error("La cle IndexNow n'est pas encore disponible sur le site publie.");
}

async function main() {
  if (readFileSync(`${key}.txt`, "utf8").trim() !== key) throw new Error("Contenu local de la cle IndexNow incorrect.");
  const urlList = urlsToSubmit(changedFiles());

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, host, keyLocation, urlList }, null, 2));
    process.exit(0);
  }

  if (urlList.length === 0) {
    console.log("Aucune page HTML modifiee : aucun signal IndexNow a envoyer.");
    process.exit(0);
  }

  await waitForPublishedKey();

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
    signal: AbortSignal.timeout(30_000),
  });

  if (![200, 202].includes(response.status)) {
    const details = await response.text();
    throw new Error(`IndexNow a refuse la soumission (${response.status}) ${details}`);
  }

  console.log(`${urlList.length} URL signalee(s) a IndexNow (${response.status}).`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
