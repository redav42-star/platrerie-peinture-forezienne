#!/usr/bin/env python3
import re
import urllib.request
from urllib.parse import urljoin

ROOT = "http://127.0.0.1:8000/"
PAGES = [
    "",
    "renovation-appartement.html",
    "chantier-renovation-appartement-saint-etienne-2023.html",
    "peinture-airless.html",
    "platrerie.html",
    "cloisons-faux-plafonds.html",
    "contact.html",
    "ratissage-enduits.html",
    "bandes-a-joints-jointeur.html",
]
IMG_RE = re.compile(r"""<img[^>]+src=["']([^"']+)["']""", re.I)

def main() -> int:
    bad = []
    for page in PAGES:
        url = ROOT + page
        html = urllib.request.urlopen(url, timeout=10).read().decode("utf-8", "replace")
        print("PAGE", url, len(html))
        for src in IMG_RE.findall(html):
            if src.startswith(("http:", "https:", "//", "data:")):
                continue
            u = urljoin(url, src)
            try:
                with urllib.request.urlopen(u, timeout=10) as r:
                    if r.status != 200:
                        bad.append((u, r.status))
            except Exception as exc:
                bad.append((u, str(exc)))
    print("BAD", len(bad))
    for item in bad:
        print(item)
    return 1 if bad else 0

if __name__ == "__main__":
    raise SystemExit(main())
