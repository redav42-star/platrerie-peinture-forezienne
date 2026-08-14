#!/usr/bin/env python3
"""Create web JPEGs from unmodified originals. Never upscale. Never touch sources."""
from __future__ import annotations

import csv
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "chantiers" / "import-originals"
DST = ROOT / "assets" / "chantiers" / "web"
MAX_LONG = 1800
QUALITY = 90
SKIP = {"CONTACT_SHEET_AUDIT_NE_PAS_PUBLIER.jpg"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    DST.mkdir(parents=True, exist_ok=True)
    manifest_path = SRC / "MANIFEST_PHOTOS.csv"
    expected = {}
    if manifest_path.exists():
        with manifest_path.open(encoding="utf-8-sig") as f:
            for row in csv.DictReader(f, delimiter=";"):
                expected[row["fichier"]] = row

    rows = []
    jpgs = sorted(p for p in SRC.glob("*.jpg") if p.name not in SKIP)
    if len(jpgs) != 26:
        print(f"WARN: expected 26 originals, found {len(jpgs)}", file=sys.stderr)

    for src in jpgs:
        im = Image.open(src)
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        sw, sh = im.size
        long_side = max(sw, sh)
        scale = min(1.0, MAX_LONG / long_side)
        nw, nh = round(sw * scale), round(sh * scale)
        if (nw, nh) != (sw, sh):
            im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        out = DST / src.name
        im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        rec = {
            "file": src.name,
            "src_px": [sw, sh],
            "web_px": [nw, nh],
            "src_bytes": src.stat().st_size,
            "web_bytes": out.stat().st_size,
            "upscaled": False,
            "sha256": sha256(src),
        }
        if src.name in expected:
            rec["manifest_ok"] = rec["sha256"] == expected[src.name]["sha256"]
            rec["manifest_px_ok"] = (
                int(expected[src.name]["largeur_px"]) == sw
                and int(expected[src.name]["hauteur_px"]) == sh
            )
        rows.append(rec)
        print(f"{src.name:40} {sw}x{sh} -> {nw}x{nh}  {out.stat().st_size} o")

    report = ROOT / "reports" / "web_photos.json"
    report.parent.mkdir(exist_ok=True)
    report.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    bad = [r for r in rows if r.get("manifest_ok") is False]
    if bad:
        print("MANIFEST SHA mismatch:", [r["file"] for r in bad], file=sys.stderr)
        return 1
    print(f"Wrote {len(rows)} web photos to {DST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
