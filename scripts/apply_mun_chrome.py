#!/usr/bin/env python3
"""Apply overlay header/nav and site.js to every HTML page."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"googledc9bb4fdc88e0307.html"}

OLD = (
    '<a class="skip-link" href="#contenu">Aller au contenu</a>\n'
    '<div class="topbar"><div class="container"><span>Saint-Étienne · Loire et alentours</span>'
    '<a href="tel:+33616783444">06 16 78 34 44</a></div></div>\n'
    '<header><div class="container nav"><a class="brand" href="index.html">'
    '<img src="assets/logo-premium.webp" width="660" height="225" alt="Panthère - Plâtrerie Peinture Forézienne">'
    '<span>PLÂTRERIE PEINTURE<br>FORÉZIENNE</span></a>'
    '<nav aria-label="Navigation principale">'
    '<a href="index.html">Accueil</a>'
    '<a href="platrerie.html">Plâtrerie</a>'
    '<a href="peinture-airless.html">Peinture & Airless</a>'
    '<a href="degats-des-eaux.html">Dégâts des eaux</a>'
    '<a href="contact.html">Contact</a>'
    '<a class="btn btn-green" href="contact.html">Devis</a>'
    "</nav></div></header>"
)

NEW = """<a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="site-header">
<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-menu" aria-label="Ouvrir le menu">Menu</button>
<a class="brand" href="index.html"><img src="assets/logo-premium.webp" width="660" height="225" alt="Panthère - Plâtrerie Peinture Forézienne"><span>PLÂTRERIE PEINTURE<br>FORÉZIENNE</span></a>
<a class="header-cta" href="contact.html">Devis</a>
</header>
<nav id="site-menu" class="site-menu" aria-label="Navigation principale" hidden>
<button type="button" class="menu-close" aria-label="Fermer le menu">Fermer</button>
<div class="menu-panel">
<div class="menu-list">
<a href="index.html">Accueil</a>
<a href="platrerie.html" data-photo="assets/chantiers/display/20241005_073140.webp">Plâtrerie</a>
<a href="peinture-airless.html" data-photo="assets/chantiers/display/20230922_120900.webp">Peinture & Airless</a>
<a href="renovation-appartement.html" data-photo="assets/chantiers/display/20230922_120844.webp">Rénovation</a>
<a href="degats-des-eaux.html" data-photo="assets/chantiers/display/20230530_095338.webp">Dégâts des eaux</a>
<a href="chantier-renovation-appartement-saint-etienne-2023.html" data-photo="assets/chantiers/display/20230922_120855.webp">Réalisations</a>
<a href="contact.html">Contact</a>
<a href="contact.html">Devis</a>
</div>
<div class="menu-preview" aria-hidden="true"></div>
</div>
<div class="menu-meta"><span>Saint-Étienne · Loire et alentours</span><a href="tel:+33616783444">06 16 78 34 44</a></div>
</nav>"""

FOOTER_LOGO = (
    '<img class="footer-logo" src="assets/logo-premium.webp" width="660" height="225" '
    'alt="Panthère - Plâtrerie Peinture Forézienne">'
)


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        if path.name in SKIP or path.name == "index.html":
            continue
        raw = path.read_bytes()
        nl = "\r\n" if b"\r\n" in raw else "\n"
        text = raw.decode("utf-8")
        old = OLD.replace("\n", nl)
        new = NEW.replace("\n", nl)
        if old not in text:
            raise SystemExit(f"chrome not found in {path.name}")
        text = text.replace(old, new, 1)
        if '<footer class="' not in text:
            text = text.replace("<footer>", '<footer class="site-footer">', 1)
        marker = '<footer class="site-footer"><div class="container">'
        if marker in text and 'class="footer-logo"' not in text:
            text = text.replace(marker, marker + FOOTER_LOGO, 1)
        site_tag = '<script src="assets/js/site.js" defer></script>'
        if "assets/js/site.js" not in text:
            if "assets/js/gallery.js" in text:
                text = text.replace(
                    '<script src="assets/js/gallery.js"',
                    site_tag + nl + '<script src="assets/js/gallery.js"',
                    1,
                )
            else:
                text = text.replace("</body>", site_tag + nl + "</body>", 1)
        path.write_bytes(text.encode("utf-8"))
        print("updated", path.name)


if __name__ == "__main__":
    main()
