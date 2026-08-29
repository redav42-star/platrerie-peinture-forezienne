#!/usr/bin/env python3
"""Mobile 375 visual regressions for Lighthouse follow-up."""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOT = ROOT / "reports" / "lighthouse" / "mobile" / "visual-375"
BASE = "http://127.0.0.1:8000"
PAGES = [
    ("accueil", "/"),
    ("degats", "/degats-des-eaux.html"),
    ("renovation", "/renovation-appartement.html"),
    ("chantier-2023", "/chantier-renovation-appartement-saint-etienne-2023.html"),
    ("contact", "/contact.html"),
]


def main() -> None:
    SHOT.mkdir(parents=True, exist_ok=True)
    fails = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        for slug, path in PAGES:
            page.goto(BASE + path, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(200)
            page.screenshot(path=str(SHOT / f"{slug}.png"), full_page=False)
            ba = page.locator(".before-after, .case-gallery").first
            if ba.count():
                ba.scroll_into_view_if_needed()
                page.wait_for_timeout(400)
                page.screenshot(path=str(SHOT / f"{slug}-photos.png"), full_page=False)
            data = page.evaluate(
                """() => {
                  const step = document.querySelector('.step');
                  const imgs = [...document.querySelectorAll('.before-after img, .case-gallery img')].slice(0, 2);
                  const cs = step ? getComputedStyle(step) : null;
                  const td = step ? getComputedStyle(step.querySelector('div') || step) : null;
                  return {
                    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
                    stepBg: cs && cs.backgroundColor,
                    stepColor: td && td.color,
                    photos: imgs.map(i => ({src: i.currentSrc, nw: i.naturalWidth, nh: i.naturalHeight, w: i.clientWidth, h: i.clientHeight, complete: i.complete})),
                    broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length
                  };
                }"""
            )
            page.locator(".menu-toggle").click()
            page.wait_for_timeout(250)
            nav = page.evaluate(
                """() => {
                  const nav = [...document.querySelectorAll('nav a')];
                  return {
                    nav: nav.map(a => a.innerText.trim()),
                    navVisible: nav.filter(a => a.offsetParent !== null || a.getClientRects().length).length
                  };
                }"""
            )
            data.update(nav)
            page.locator(".menu-close").click()
            page.wait_for_timeout(150)
            print(slug, data)
            if data["overflow"]:
                fails.append(f"{slug} overflow")
            if data["broken"]:
                fails.append(f"{slug} broken images {data['broken']}")
            if data["navVisible"] < 6:
                fails.append(f"{slug} nav {data['navVisible']}")
            if slug == "degats":
                dark = data["stepBg"] and data["stepBg"].startswith("rgb(") and all(int(x) < 50 for x in data["stepBg"][4:-1].split(","))
                if not dark or data["stepColor"] != "rgb(255, 255, 255)":
                    fails.append(f"{slug} step {data['stepBg']} {data['stepColor']}")
            if slug in {"accueil", "renovation", "chantier-2023"}:
                if not data["photos"] or any(p["nw"] < 600 for p in data["photos"]):
                    fails.append(f"{slug} photos {data['photos']}")
        browser.close()
    if fails:
        raise SystemExit("FAIL " + "; ".join(fails))
    print("REGRESSION_HOME_BEFORE_AFTER = PASS")
    print("REGRESSION_DEGATS_STEP_TEXT = PASS")
    print("REGRESSION_MOBILE_MENU = PASS")


if __name__ == "__main__":
    main()
