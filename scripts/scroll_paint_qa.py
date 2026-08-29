#!/usr/bin/env python3
"""Scroll-scrub paint scene captures and interaction checks."""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "paint-scroll"
BASE = "http://127.0.0.1:8000/"


def paint_state(page):
    return page.evaluate(
        """() => {
          const stage = document.querySelector('[data-paint-stage]');
          if (!stage) return null;
          const cs = getComputedStyle(stage);
          const roller = document.querySelector('.paint-roller');
          const rs = roller ? getComputedStyle(roller) : null;
          return {
            p: parseFloat(cs.getPropertyValue('--p')) || 0,
            b1: parseFloat(cs.getPropertyValue('--b1')) || 0,
            b2: parseFloat(cs.getPropertyValue('--b2')) || 0,
            b3: parseFloat(cs.getPropertyValue('--b3')) || 0,
            rx: cs.getPropertyValue('--rx').trim(),
            ry: cs.getPropertyValue('--ry').trim(),
            rr: cs.getPropertyValue('--rr').trim(),
            transform: rs ? rs.transform : null,
            ready: document.querySelector('.paint-story')?.classList.contains('paint-ready')
          };
        }"""
    )


def scroll_to_progress(page, frac):
    page.evaluate(
        """(frac) => {
          const story = document.querySelector('.paint-story');
          const start = story.offsetTop;
          const distance = Math.max(1, story.offsetHeight - window.innerHeight);
          window.scrollTo(0, start + distance * frac);
        }""",
        frac,
    )
    page.wait_for_timeout(180)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fails = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(BASE, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(400)
        states = {}
        for pct in (0, 20, 50, 80, 100):
            scroll_to_progress(page, pct / 100)
            page.screenshot(path=str(OUT / f"desktop-{pct:02d}.png"), full_page=False)
            states[pct] = paint_state(page)
            print("desktop", pct, states[pct])
            if pct == 50:
                pause = states[50]["p"]
                page.wait_for_timeout(350)
                held = paint_state(page)
                if abs(held["p"] - pause) > 0.03:
                    fails.append("pause drifted")
                scroll_to_progress(page, 0.2)
                back = paint_state(page)
                print("reverse", back)
                if back["p"] >= pause - 0.08:
                    fails.append("reverse did not rewind")
                scroll_to_progress(page, 0.5)
        if not states[0] or not states[0]["ready"]:
            fails.append("scene not ready")
        if states[50]["p"] <= states[20]["p"]:
            fails.append("forward progress")
        if states[50]["rx"] == states[20]["rx"] and states[50]["ry"] == states[20]["ry"]:
            fails.append("roller did not move")
        if states[80]["b1"] < 0.9:
            fails.append(f"band1 not filling {states[80]['b1']}")
        print("SCROLL_PAINT_FORWARD =", "PASS" if "forward progress" not in fails and "roller did not move" not in fails else "FAIL")
        print("SCROLL_PAINT_REVERSE =", "PASS" if "reverse did not rewind" not in fails else "FAIL")
        print("SCROLL_PAINT_PAUSE =", "PASS" if "pause drifted" not in fails else "FAIL")

        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(300)
        for pct in (0, 50, 100):
            scroll_to_progress(page, pct / 100)
            page.screenshot(path=str(OUT / f"mobile-{pct:02d}.png"), full_page=False)
            print("mobile", pct, paint_state(page))
        overflow = page.evaluate(
            "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2"
        )
        if overflow:
            fails.append("mobile overflow")
        print("SCROLL_PAINT_MOBILE =", "PASS" if not overflow else "FAIL")

        page.emulate_media(reduced_motion="reduce")
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(300)
        reduced = page.evaluate(
            """() => ({
              ready: document.querySelector('.paint-story')?.classList.contains('paint-ready'),
            h1: (document.querySelector('h1')?.innerText || '').replace(/\s+/g, ' ').trim()
            })"""
        )
        print("reduced", reduced)
        if reduced["h1"] != "Plâtrier peintre à Saint-Étienne":
            fails.append("reduced h1")
        if reduced["ready"]:
            fails.append("reduced still ready")
        print("REDUCED_MOTION_FALLBACK =", "PASS" if "reduced h1" not in fails and "reduced still ready" not in fails else "FAIL")
        browser.close()
    if fails:
        raise SystemExit("FAIL " + "; ".join(fails))
    print("SCROLL_PAINT_QA = PASS")


if __name__ == "__main__":
    main()
