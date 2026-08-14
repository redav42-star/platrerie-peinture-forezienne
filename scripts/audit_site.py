#!/usr/bin/env python3
"""Static site audit for HTML/CSS/JS/assets. No network required."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_PAGES = {"googledc9bb4fdc88e0307.html"}
IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
ATTR_RE = re.compile(r"""([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(['"])(.*?)\2""", re.S)
HREF_RE = re.compile(r"""\bhref=["']([^"']+)["']""", re.I)
SRC_RE = re.compile(r"""\bsrc=["']([^"']+)["']""", re.I)
H1_RE = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.I | re.S)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.I | re.S)
DESC_RE = re.compile(r"""<meta\s+name=["']description["']\s+content=["'](.*?)["']""", re.I | re.S)
CANON_RE = re.compile(r"""<link\s+rel=["']canonical["']\s+href=["'](.*?)["']""", re.I | re.S)
ROBOTS_RE = re.compile(r"""<meta\s+name=["']robots["']\s+content=["'](.*?)["']""", re.I | re.S)
JSONLD_RE = re.compile(r"""<script[^>]*type=["']application/ld\+json["'][^>]*>(.*?)</script>""", re.I | re.S)
LANG_RE = re.compile(r"""<html[^>]*\blang=["']([^"']+)["']""", re.I)
ID_RE = re.compile(r"""\bid=["']([^"']+)["']""", re.I)
STRIP_TAGS = re.compile(r"<[^>]+>")


def attrs(tag: str) -> dict:
    return {m.group(1).lower(): m.group(3) for m in ATTR_RE.finditer(tag)}


def is_internal(url: str) -> bool:
    if not url or url.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return False
    if url.startswith(("http://", "https://", "//")):
        return False
    return True


def resolve(page: Path, url: str) -> Path:
    url = url.split("#", 1)[0].split("?", 1)[0]
    return (page.parent / url).resolve()


def text_of(html_fragment: str) -> str:
    return re.sub(r"\s+", " ", STRIP_TAGS.sub(" ", html_fragment)).strip()


class NestParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.errors: list[str] = []
        self.void = {
            "area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr",
        }

    def handle_starttag(self, tag, attrs):
        if tag not in self.void:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.void:
            return
        if tag in self.stack:
            while self.stack:
                last = self.stack.pop()
                if last == tag:
                    break
                self.errors.append(f"unclosed {last} before </{tag}>")
        else:
            self.errors.append(f"unexpected </{tag}>")


def img_meta(path: Path) -> dict:
    info = {"exists": path.exists(), "bytes": None, "px": None, "format": None, "readable": False, "exif": False}
    if not path.exists():
        return info
    info["bytes"] = path.stat().st_size
    try:
        from PIL import Image
        with Image.open(path) as im:
            info["px"] = list(im.size)
            info["format"] = im.format
            im.load()
            info["readable"] = True
            info["exif"] = bool(getattr(im, "getexif", lambda: {})() or False)
            if "exif" in (im.info or {}):
                info["exif"] = True
    except Exception as exc:
        info["error"] = str(exc)
    return info


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html"))
    content_pages = [p for p in pages if p.name not in SKIP_PAGES]
    images, broken_images, missing_alts, tiny = [], [], [], []
    broken_links, missing_assets = [], []
    titles, descs, h1s = [], [], []
    jsonld_errors = []
    nest_errors = []
    dup_ids = []
    pages_info = []

    for page in pages:
        html = page.read_text(encoding="utf-8")
        parser = NestParser()
        try:
            parser.feed(html)
            parser.close()
        except Exception as exc:
            nest_errors.append({"page": page.name, "error": str(exc)})
        if parser.errors:
            nest_errors.append({"page": page.name, "errors": parser.errors[:8]})
        ids = ID_RE.findall(html)
        counts = Counter(ids)
        for i, n in counts.items():
            if n > 1:
                dup_ids.append({"page": page.name, "id": i, "count": n})

        title = text_of(TITLE_RE.search(html).group(1)) if TITLE_RE.search(html) else ""
        desc = DESC_RE.search(html).group(1) if DESC_RE.search(html) else ""
        h1_list = [text_of(m) for m in H1_RE.findall(html)]
        if page.name not in SKIP_PAGES:
            titles.append((page.name, title))
            descs.append((page.name, desc))
            h1s.append((page.name, h1_list))
        canonical = CANON_RE.search(html).group(1) if CANON_RE.search(html) else ""
        robots = ROBOTS_RE.search(html).group(1) if ROBOTS_RE.search(html) else ""
        lang = LANG_RE.search(html).group(1) if LANG_RE.search(html) else ""
        pages_info.append({
            "page": page.name,
            "title": title,
            "description": desc,
            "h1": h1_list,
            "canonical": canonical,
            "robots": robots,
            "lang": lang,
        })
        for block in JSONLD_RE.findall(html):
            try:
                json.loads(block)
            except Exception as exc:
                jsonld_errors.append({"page": page.name, "error": str(exc)})

        for tag in IMG_RE.findall(html):
            a = attrs(tag)
            src = a.get("src", "")
            rec = {
                "page": page.name,
                "src": src,
                "alt": a.get("alt"),
                "width_attr": a.get("width"),
                "height_attr": a.get("height"),
                "loading": a.get("loading"),
            }
            dest = resolve(page, src) if src and is_internal(src) else None
            if dest:
                rec.update(img_meta(dest))
                if not rec.get("exists") or rec.get("readable") is False:
                    broken_images.append(rec)
                elif rec.get("bytes") and rec["bytes"] < 20000 and rec.get("px") and rec["px"][0] <= 400:
                    tiny.append(rec)
            elif src and is_internal(src):
                broken_images.append(rec)
            if page.name not in SKIP_PAGES and (rec.get("alt") is None or rec.get("alt") == ""):
                missing_alts.append(rec)
            images.append(rec)

        for href in HREF_RE.findall(html):
            if not is_internal(href):
                continue
            dest = resolve(page, href)
            if not dest.suffix and not href.endswith(".html"):
                continue
            if dest.suffix.lower() in {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".xml", ".txt"}:
                if not dest.exists():
                    broken_links.append({"page": page.name, "href": href})
                    missing_assets.append({"page": page.name, "href": href})
            elif dest.suffix.lower() == ".html" and not dest.exists():
                broken_links.append({"page": page.name, "href": href})

        for src in SRC_RE.findall(html):
            if not is_internal(src):
                continue
            dest = resolve(page, src)
            if dest.suffix and not dest.exists():
                missing_assets.append({"page": page.name, "src": src})

    title_dup = [t for t, n in Counter(t for _, t in titles).items() if n > 1]
    desc_dup = [d for d, n in Counter(d for _, d in descs).items() if n > 1]
    no_h1 = [p for p, hs in h1s if len(hs) == 0]
    multi_h1 = [p for p, hs in h1s if len(hs) > 1]
    invalid_canon = []
    for info in pages_info:
        if info["page"] in SKIP_PAGES:
            continue
        c = info["canonical"]
        if not c.startswith("https://redav42-star.github.io/platrerie-peinture-forezienne"):
            invalid_canon.append(info)

    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    chantier_in_sitemap = "chantier-renovation-appartement-saint-etienne-2023.html" in sitemap
    chantier_html = (ROOT / "chantier-renovation-appartement-saint-etienne-2023.html").read_text(encoding="utf-8")
    chantier_noindex = "noindex" in (ROBOTS_RE.search(chantier_html).group(1).lower() if ROBOTS_RE.search(chantier_html) else "")

    sensitive = []
    for pattern in ["*.zip", "*CONTACT_SHEET*", "*.env", "*secret*", "*token*", "MANIFEST_PHOTOS.csv", "README_CURSOR.txt"]:
        for p in ROOT.rglob(pattern):
            if ".git" in p.parts or "import-originals" in p.parts:
                continue
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            tracked = True
            sensitive.append(rel)

    tracked_sensitive = []
    import subprocess
    ls = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True)
    tracked = set(ls.splitlines())
    for name in [
        "SEO-LINK-BUILDING.md",
        "photos-chantiers-originaux-pour-cursor.zip",
        "CONTACT_SHEET_AUDIT_NE_PAS_PUBLIER.jpg",
        "assets/chantiers/import-originals/MANIFEST_PHOTOS.csv",
        "assets/chantiers/2023/avant-piece.jpg",
        "assets/chantiers/2023/avant-plafond.jpg",
    ]:
        if name in tracked:
            tracked_sensitive.append(name)

    report = {
        "pages": pages_info,
        "images": images,
        "broken_images": broken_images,
        "broken_internal_links": broken_links,
        "missing_local_assets": missing_assets,
        "missing_alts": missing_alts,
        "tiny_or_thumbnail": tiny,
        "duplicate_titles": title_dup,
        "duplicate_descriptions": desc_dup,
        "pages_without_h1": no_h1,
        "pages_with_multiple_h1": multi_h1,
        "invalid_canonical": [x["page"] for x in invalid_canon],
        "jsonld_errors": jsonld_errors,
        "html_nest_errors": nest_errors,
        "duplicate_ids": dup_ids,
        "CHANTIER_2023_INDEXABLE": not chantier_noindex,
        "CHANTIER_2023_DANS_SITEMAP": chantier_in_sitemap,
        "BROKEN_IMAGES": len(broken_images),
        "BROKEN_INTERNAL_LINKS": len(broken_links),
        "MISSING_LOCAL_ASSETS": len(missing_assets),
        "PAGES_WITHOUT_H1": len(no_h1),
        "PAGES_WITH_MULTIPLE_H1": len(multi_h1),
        "INVALID_CANONICAL_INTERNAL": len(invalid_canon),
        "JSON_LD_PARSE_ERRORS": len(jsonld_errors),
        "UNLABELED_MEANINGFUL_IMAGES": len(missing_alts),
        "PUBLIC_SENSITIVE_FILES": len(tracked_sensitive),
        "tracked_sensitive": tracked_sensitive,
        "DUPLICATE_TITLES_UNINTENTIONAL": len(title_dup),
        "DUPLICATE_META_DESCRIPTIONS_UNINTENTIONAL": len(desc_dup),
    }
    out = ROOT / "reports" / "site_audit_static.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    gates = [
        "BROKEN_IMAGES", "BROKEN_INTERNAL_LINKS", "MISSING_LOCAL_ASSETS",
        "PAGES_WITHOUT_H1", "PAGES_WITH_MULTIPLE_H1", "INVALID_CANONICAL_INTERNAL",
        "JSON_LD_PARSE_ERRORS", "PUBLIC_SENSITIVE_FILES", "UNLABELED_MEANINGFUL_IMAGES",
    ]
    for g in gates:
        print(f"{g} = {report[g]}")
    print("CHANTIER_2023_INDEXABLE =", "OK" if not chantier_noindex else "FAIL")
    print("CHANTIER_2023_DANS_SITEMAP =", "OK" if chantier_in_sitemap else "FAIL")
    fail = any(report[g] != 0 for g in gates) or chantier_noindex or not chantier_in_sitemap
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())

