#!/usr/bin/env python3
"""Audit local HTML images and internal links. No network. No writes to assets."""
from __future__ import annotations
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG_RE = re.compile(r'<img\b[^>]*>', re.I)
SRC_RE = re.compile(r'\bsrc=["\']([^"\']+)["\']', re.I)
HREF_RE = re.compile(r'\bhref=["\']([^"\']+)["\']', re.I)
WH_RE = re.compile(r'\b(width|height)=["\'](\d+)["\']', re.I)

def parse_img(tag: str) -> dict:
    src_m = SRC_RE.search(tag)
    src = src_m.group(1) if src_m else ""
    wh = dict((k.lower(), int(v)) for k, v in WH_RE.findall(tag))
    return {"src": src, "width_attr": wh.get("width"), "height_attr": wh.get("height")}

def is_internal(url: str) -> bool:
    if not url or url.startswith(("#", "mailto:", "tel:", "javascript:")):
        return False
    if url.startswith("http://") or url.startswith("https://") or url.startswith("//"):
        return False
    return True

def resolve(page: Path, url: str) -> Path:
    url = url.split("#", 1)[0].split("?", 1)[0]
    return (page.parent / url).resolve()

def img_meta(path: Path) -> dict:
    info = {"exists": path.exists(), "bytes": None, "px": None, "format": None, "readable": False}
    if not path.exists():
        return info
    info["bytes"] = path.stat().st_size
    try:
        from PIL import Image, ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = False
        with Image.open(path) as im:
            info["px"] = list(im.size)
            info["format"] = im.format
            im.load()
            info["readable"] = True
    except Exception as e:
        info["error"] = str(e)
        try:
            from PIL import Image, ImageFile
            ImageFile.LOAD_TRUNCATED_IMAGES = True
            with Image.open(path) as im:
                info["px"] = list(im.size)
                info["format"] = im.format
                info["truncated"] = True
        except Exception:
            pass
    return info

def main() -> int:
    pages = sorted(ROOT.glob("*.html"))
    images = []
    broken_images = []
    broken_links = []
    small = []
    for page in pages:
        html = page.read_text(encoding="utf-8")
        for tag in IMG_RE.findall(html):
            rec = parse_img(tag)
            rec["page"] = page.name
            dest = resolve(page, rec["src"]) if rec["src"] else None
            rec["resolved"] = str(dest) if dest else None
            meta = img_meta(dest) if dest else {"exists": False}
            rec.update(meta)
            images.append(rec)
            if not rec.get("exists") or rec.get("readable") is False:
                broken_images.append(rec)
            elif rec.get("bytes") and rec["bytes"] < 20000 and rec.get("px") and rec["px"][0] <= 400:
                small.append(rec)
        for href in HREF_RE.findall(html):
            if not is_internal(href):
                continue
            dest = resolve(page, href)
            if dest.suffix.lower() in {".html", ""} or dest.name.endswith(".html"):
                if href.endswith("/") or not dest.suffix:
                    continue
            if not dest.exists() and dest.suffix:
                broken_links.append({"page": page.name, "href": href, "resolved": str(dest)})
            elif dest.suffix.lower() == ".html" and not dest.exists():
                broken_links.append({"page": page.name, "href": href, "resolved": str(dest)})
            elif dest.suffix.lower() in {".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".xml", ".txt"} and not dest.exists():
                broken_links.append({"page": page.name, "href": href, "resolved": str(dest)})
    report = {
        "pages": [p.name for p in pages],
        "images": images,
        "broken_images": broken_images,
        "broken_internal_links": broken_links,
        "tiny_or_thumbnail": small,
        "BROKEN_IMAGES": len(broken_images),
        "BROKEN_INTERNAL_LINKS": len(broken_links),
    }
    out = ROOT / "reports" / "asset_audit.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("BROKEN_IMAGES =", report["BROKEN_IMAGES"])
    print("BROKEN_INTERNAL_LINKS =", report["BROKEN_INTERNAL_LINKS"])
    for b in broken_images:
        print(" IMG", b["page"], b["src"], b.get("error") or "missing")
    for b in broken_links:
        print(" HREF", b["page"], b["href"])
    return 0 if report["BROKEN_IMAGES"] == 0 and report["BROKEN_INTERNAL_LINKS"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
