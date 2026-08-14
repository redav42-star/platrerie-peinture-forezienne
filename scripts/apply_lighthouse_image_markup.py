#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

BRAND = '<img src="assets/logo-panthere.png" alt="Panthère - Plâtrerie Peinture Forézienne">'
BRAND_NEW = '<img src="assets/logo-panthere.png" width="64" height="64" alt="Panthère - Plâtrerie Peinture Forézienne">'
HERO = '<img src="assets/logo-panthere.png" alt="Logo Plâtrerie Peinture Forézienne">'
HERO_NEW = '<img src="assets/logo-panthere.png" width="240" height="240" alt="Logo Plâtrerie Peinture Forézienne">'

IMG_RE = re.compile(
    r'<img src="assets/chantiers/web/([^"]+)" width="(\d+)" height="(\d+)"([^>]*)>'
)


def repl_img(match: re.Match) -> str:
    name, width, height, rest = match.groups()
    rest = rest.replace(' fetchpriority="high"', "")
    if "loading=" not in rest:
        rest = ' loading="lazy"' + rest
    stem = Path(name).stem
    return (
        f'<picture><source type="image/webp" srcset="assets/chantiers/display/{stem}.webp">'
        f'<img src="assets/chantiers/display/{name}" width="{width}" height="{height}"{rest}></picture>'
    )


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        updated = text.replace(BRAND, BRAND_NEW).replace(HERO, HERO_NEW)
        updated = IMG_RE.sub(repl_img, updated)
        if updated != text:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print("updated", path.name)
        else:
            print("unchanged", path.name)


if __name__ == "__main__":
    main()
