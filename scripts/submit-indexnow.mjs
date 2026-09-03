import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const host = "redav42-star.github.io";
const siteRoot = `https://${host}/platrerie-peinture-forezienne/`;
const key = "608163cc152a07304fbc7afd2284609f";
const keyLocation = `${siteRoot}${key}.txt`;
const before = process.argv[2];
const after = process.argv[3] || "HEAD";

function readSitemapUrls() {
  const xml = readFileSync("sitemap.xml", "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function changedFiles() {
  if (!before || /^0+$/.test(before)) return ["sitemap.xml"];

  try {
    return execFileSync("git", ["diff", "--name-only", before, after], {
      encoding: "utf8",
    })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch {
    return ["sitemap.xml"];
  }
}

function urlsToSubmit(files) {
  if (files.includes("sitemap.xml")) return readSitemapUrls();

  const urls = files.flatMap((file) => {
    if (file === "index.html") return [siteRoot];
    if (/^[^/]+\.html$/.test(file)) return [`${siteRoot}${file}`];
    return [];
  });

  return [...new Set(urls)];
}

async function waitForPublishedKey() {
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    try {
      const response = await fetch(keyLocation, {
        headers: { "cache-control": "no-cache" },
      });
      const body = (await response.text()).trim();
      if (response.ok && body === key) return;
    } catch {
      // GitHub Pages may still be publishing. Retry below.
    }

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  throw new Error("La cle IndexNow n'est pas encore disponible sur le site publie.");
}

const urlList = urlsToSubmit(changedFiles());

if (urlList.length === 0) {
  console.log("Aucune page HTML modifiee : aucun signal IndexNow a envoyer.");
  process.exit(0);
}

await waitForPublishedKey();

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (![200, 202].includes(response.status)) {
  const details = await response.text();
  throw new Error(`IndexNow a refuse la soumission (${response.status}) ${details}`);
}

console.log(`${urlList.length} URL signalee(s) a IndexNow (${response.status}).`);
