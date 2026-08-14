#!/usr/bin/env python3
"""Browser QA: overflow, console, failed requests, screenshots. Requires playwright."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOT = ROOT / "reports" / "site_audit" / "screenshots"
BASE = "http://127.0.0.1:8000"
PAGES = [
    "/",
    "/platrerie.html",
    "/bandes-a-joints-jointeur.html",
    "/peinture-airless.html",
    "/ratissage-enduits.html",
    "/cloisons-faux-plafonds.html",
    "/renovation-appartement.html",
    "/chantier-renovation-appartement-saint-etienne-2023.html",
    "/degats-des-eaux.html",
    "/quand-repeindre-apres-degat-des-eaux.html",
    "/professionnels.html",
    "/contact.html",
]
VIEWPORTS = [
    (375, 812, "375"),
    (430, 932, "430"),
    (768, 1024, "768"),
    (1024, 768, "1024"),
    (1440, 900, "1440"),
]
REQUIRED_SHOTS = {
    ("/", "375"),
    ("/", "1440"),
    ("/degats-des-eaux.html", "375"),
    ("/degats-des-eaux.html", "1440"),
    ("/renovation-appartement.html", "375"),
    ("/renovation-appartement.html", "1440"),
    ("/chantier-renovation-appartement-saint-etienne-2023.html", "375"),
    ("/chantier-renovation-appartement-saint-etienne-2023.html", "1440"),
    ("/peinture-airless.html", "375"),
    ("/peinture-airless.html", "1440"),
    ("/contact.html", "375"),
    ("/contact.html", "1440"),
}


def slug(path: str) -> str:
    return "index" if path == "/" else path.strip("/").replace(".html", "").replace("/", "-")


def main() -> int:
    from playwright.sync_api import sync_playwright

    SHOT.mkdir(parents=True, exist_ok=True)
    results = []
    console_errors = []
    js_errors = []
    overflow_pages = []
    page_404 = []
    asset_404 = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for w, h, label in VIEWPORTS:
            context = browser.new_context(viewport={"width": w, "height": h})
            page = context.new_page()
            page.on("console", lambda msg, label=label: console_errors.append({"type": msg.type, "text": msg.text, "vp": label}) if msg.type in {"error"} else None)
            page.on("pageerror", lambda err, label=label: js_errors.append({"text": str(err), "vp": label}))

            def on_response(resp, path_ref):
                url = resp.url
                if "127.0.0.1:8000" not in url:
                    return
                if resp.status >= 400:
                    rec = {"url": url, "status": resp.status, "page": path_ref[0]}
                    if url.endswith(".html") or url.rstrip("/").endswith("8000"):
                        page_404.append(rec)
                    else:
                        asset_404.append(rec)

            path_ref = [""]
            page.on("response", lambda resp: on_response(resp, path_ref))

            for path in PAGES:
                path_ref[0] = path
                page.goto(BASE + path, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(250)
                metrics = page.evaluate(
                    """() => ({
                      w: document.documentElement.clientWidth,
                      sw: document.documentElement.scrollWidth,
                      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
                      brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.src),
                      navCount: document.querySelectorAll('nav a').length,
                      stepColor: (() => {
                        const el = document.querySelector('.step');
                        if (!el) return null;
                        const cs = getComputedStyle(el);
                        const t = getComputedStyle(el.querySelector('div') || el);
                        return {bg: cs.backgroundColor, color: t.color, strong: el.querySelector('strong') ? getComputedStyle(el.querySelector('strong')).color : null};
                      })(),
                      avant: (() => {
                        const img = document.querySelector('.before-after img');
                        return img ? {src: img.currentSrc, nw: img.naturalWidth, dw: img.clientWidth, dh: img.clientHeight} : null;
                      })()
                    })"""
                )
                rec = {"page": path, "viewport": label, **metrics}
                results.append(rec)
                if metrics.get("overflow"):
                    overflow_pages.append(rec)
                if (path, label) in REQUIRED_SHOTS:
                    page.screenshot(path=str(SHOT / f"{slug(path)}-{label}.png"), full_page=True)
            context.close()
        browser.close()

    report = {
        "results": results,
        "CONSOLE_ERRORS": len(console_errors),
        "JS_RUNTIME_ERRORS": len(js_errors),
        "HORIZONTAL_OVERFLOW_PAGES": len(overflow_pages),
        "LOCAL_PAGE_404": len(page_404),
        "LOCAL_ASSET_404": len(asset_404),
        "console_errors": console_errors,
        "js_errors": js_errors,
        "overflow": overflow_pages,
        "page_404": page_404,
        "asset_404": asset_404,
    }
    out = ROOT / "reports" / "site_audit_browser.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    for k in ["CONSOLE_ERRORS", "JS_RUNTIME_ERRORS", "HORIZONTAL_OVERFLOW_PAGES", "LOCAL_PAGE_404", "LOCAL_ASSET_404"]:
        print(f"{k} = {report[k]}")
    return 0 if all(report[k] == 0 for k in ["CONSOLE_ERRORS", "JS_RUNTIME_ERRORS", "HORIZONTAL_OVERFLOW_PAGES", "LOCAL_PAGE_404", "LOCAL_ASSET_404"]) else 1


if __name__ == "__main__":
    sys.exit(main())
