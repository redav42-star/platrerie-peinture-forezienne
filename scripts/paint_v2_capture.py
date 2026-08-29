#!/usr/bin/env python3
"""Visual capture for paint-scroll V2: stills + real scroll video."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "paint-v2"
BASE = os.environ.get("PAINT_V2_BASE", "http://127.0.0.1:8000/")


def luminance(png: Path) -> dict:
    from PIL import Image

    im = Image.open(png).convert("RGB")
    w, h = im.size
    px = list(im.getdata())
    n = len(px)
    mean = sum((0.2126 * r + 0.7152 * g + 0.0722 * b) for r, g, b in px) / n
    # center 60% sample — empty black stage would be near 0 here
    x0, y0, x1, y1 = int(w * 0.2), int(h * 0.15), int(w * 0.8), int(h * 0.85)
    crop = im.crop((x0, y0, x1, y1))
    cp = list(crop.getdata())
    cmean = sum((0.2126 * r + 0.7152 * g + 0.0722 * b) for r, g, b in cp) / len(cp)
    var = sum((0.2126 * r + 0.7152 * g + 0.0722 * b - cmean) ** 2 for r, g, b in cp) / len(cp)
    blackish = sum(1 for r, g, b in cp if r < 18 and g < 18 and b < 18) / len(cp)
    return {
        "file": png.name,
        "mean": round(mean, 2),
        "center_mean": round(cmean, 2),
        "center_var": round(var, 2),
        "black_ratio": round(blackish, 4),
        "empty_black": bool(blackish > 0.72 and cmean < 12 and var < 40),
    }


def ffmpeg_exe() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def convert_webm(webm: Path, mp4: Path) -> bool:
    ffmpeg = ffmpeg_exe()
    if not ffmpeg:
        return False
    subprocess.run(
        [ffmpeg, "-y", "-i", str(webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", str(mp4)],
        check=True,
        capture_output=True,
    )
    return True


def run_viewport(browser, label: str, width: int, height: int, record: bool) -> dict:
    from playwright.sync_api import ViewportSize

    OUT.mkdir(parents=True, exist_ok=True)
    video_dir = OUT / f"_rec_{label}"
    if video_dir.exists():
        shutil.rmtree(video_dir)
    kwargs = {
        "viewport": ViewportSize(width=width, height=height),
        "device_scale_factor": 1,
        "reduced_motion": "no-preference",
    }
    if record:
        kwargs["record_video_dir"] = str(video_dir)
        kwargs["record_video_size"] = {"width": width, "height": height}
    ctx = browser.new_context(**kwargs)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.goto(BASE, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(350)
    ready = page.evaluate("() => document.querySelector('.paint-story.paint-ready') !== null")
    story_h = page.evaluate("() => document.querySelector('.paint-story')?.offsetHeight || 0")
    view_h = page.evaluate("() => window.innerHeight")
    distance = max(1, story_h - view_h)

    stills = {}
    if not record:
        for pct in (0, 25, 50, 75, 100):
            y = int(distance * (pct / 100))
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(220)
            dest = OUT / f"{label}-{pct:02d}.png"
            page.screenshot(path=str(dest), full_page=False)
            stills[pct] = dest
            if label == "desktop":
                shutil.copyfile(dest, OUT / f"{pct:02d}.png")

    if record:
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(180)
        steps = 26
        for i in range(steps + 1):
            y = int(distance * (i / steps))
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(80)
        page.wait_for_timeout(260)
        for i in range(steps, -1, -1):
            y = int(distance * (i / steps))
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(80)
        page.wait_for_timeout(180)

    metrics = {pct: luminance(path) for pct, path in stills.items()}
    ctx.close()
    video_webm = None
    if record:
        recs = list(video_dir.glob("*.webm"))
        if recs:
            video_webm = OUT / f"scroll-demo-{label}.webm"
            recs[0].replace(video_webm)
        shutil.rmtree(video_dir, ignore_errors=True)
    return {
        "label": label,
        "ready": ready,
        "story_h": story_h,
        "view_h": view_h,
        "distance": distance,
        "errors": errors,
        "metrics": metrics,
        "video": str(video_webm) if video_webm else None,
    }


def main() -> int:
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    summary = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        desktop_stills = run_viewport(browser, "desktop", 1440, 900, False)
        mobile_stills = run_viewport(browser, "mobile", 375, 812, False)
        desktop_vid = run_viewport(browser, "desktop", 1440, 900, True)
        mobile_vid = run_viewport(browser, "mobile", 375, 812, True)
        desktop_stills["video"] = desktop_vid.get("video")
        desktop_stills["errors"].extend(desktop_vid.get("errors") or [])
        mobile_stills["video"] = mobile_vid.get("video")
        mobile_stills["errors"].extend(mobile_vid.get("errors") or [])
        summary.extend([desktop_stills, mobile_stills])
        browser.close()

    for item in summary:
        webm = Path(item["video"]) if item.get("video") else None
        if webm and webm.exists():
            mp4 = webm.with_suffix(".mp4")
            try:
                item["mp4"] = str(mp4) if convert_webm(webm, mp4) else None
            except subprocess.CalledProcessError:
                item["mp4"] = None
                item["ffmpeg_error"] = True

    empty = []
    for item in summary:
        for pct, m in item["metrics"].items():
            if m["empty_black"]:
                empty.append(f"{item['label']}-{pct}")

    report = {
        "empty_black_frames": empty,
        "BLACK_EMPTY_FRAME_COUNT": len(empty),
        "runs": summary,
    }
    (OUT / "capture-metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 1 if empty or any(r["errors"] for r in summary) else 0


if __name__ == "__main__":
    sys.exit(main())
