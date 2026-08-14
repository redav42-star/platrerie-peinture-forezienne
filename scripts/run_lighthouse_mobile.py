#!/usr/bin/env python3
"""Run 3 Lighthouse mobile audits per page and write JSON/HTML + summary."""
from __future__ import annotations

import argparse
import json
import os
import statistics
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHROME = Path.home() / "AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"
PAGES = [
    ("accueil", "https://redav42-star.github.io/platrerie-peinture-forezienne/"),
    ("degats-des-eaux", "https://redav42-star.github.io/platrerie-peinture-forezienne/degats-des-eaux.html"),
    ("renovation-appartement", "https://redav42-star.github.io/platrerie-peinture-forezienne/renovation-appartement.html"),
    ("chantier-2023", "https://redav42-star.github.io/platrerie-peinture-forezienne/chantier-renovation-appartement-saint-etienne-2023.html"),
    ("contact", "https://redav42-star.github.io/platrerie-peinture-forezienne/contact.html"),
]


def score(audits: dict, key: str) -> float | None:
    cat = audits.get("categories", {}).get(key)
    if not cat or cat.get("score") is None:
        return None
    return round(cat["score"] * 100)


def metric_ms(audits: dict, key: str) -> float | None:
    item = audits.get("audits", {}).get(key) or {}
    val = item.get("numericValue")
    return None if val is None else round(val)


def metric_score(audits: dict, key: str) -> float | None:
    item = audits.get("audits", {}).get(key) or {}
    val = item.get("numericValue")
    return None if val is None else round(val, 3)


def opportunities(audits: dict, n: int = 5) -> list[dict]:
    rows = []
    for audit_id, item in (audits.get("audits") or {}).items():
        details = item.get("details") or {}
        if details.get("type") != "opportunity":
            continue
        savings = details.get("overallSavingsMs") or item.get("metricSavings", {}).get("LCP") or 0
        if not savings:
            continue
        rows.append(
            {
                "id": audit_id,
                "title": item.get("title"),
                "savingsMs": round(savings),
                "display": item.get("displayValue"),
            }
        )
    rows.sort(key=lambda r: r["savingsMs"], reverse=True)
    failed = []
    for audit_id, item in (audits.get("audits") or {}).items():
        if item.get("score") not in (0, 0.0) or item.get("scoreDisplayMode") in ("informative", "manual", "notApplicable", "error"):
            continue
        failed.append({"id": audit_id, "title": item.get("title"), "display": item.get("displayValue")})
    return {"opportunities": rows[:n], "failed": failed[:12]}


def extract(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        "file": str(path.relative_to(ROOT)).replace("\\", "/"),
        "fetchTime": data.get("fetchTime"),
        "lighthouseVersion": data.get("lighthouseVersion"),
        "performance": score(data, "performance"),
        "accessibility": score(data, "accessibility"),
        "bestPractices": score(data, "best-practices"),
        "seo": score(data, "seo"),
        "lcp": metric_ms(data, "largest-contentful-paint"),
        "cls": metric_score(data, "cumulative-layout-shift"),
        "tbt": metric_ms(data, "total-blocking-time"),
        "fcp": metric_ms(data, "first-contentful-paint"),
        "si": metric_ms(data, "speed-index"),
        "lcpElement": ((data.get("audits") or {}).get("largest-contentful-paint-element") or {}).get("displayValue"),
        "causes": opportunities(data),
    }


def median_int(values: list) -> int | None:
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return int(round(statistics.median(nums)))


def median_float(values: list) -> float | None:
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return round(statistics.median(nums), 3)


def run_one(url: str, out_base: Path, chrome: Path) -> Path:
    out_base.parent.mkdir(parents=True, exist_ok=True)
    npx = Path(r"C:\Program Files\nodejs\npx.cmd")
    cmd = [
        str(npx),
        "--yes",
        "lighthouse@12.8.2",
        url,
        "--quiet",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--throttling-method=simulate",
        "--output=json",
        "--output=html",
        f"--output-path={out_base}",
        f"--chrome-path={chrome}",
        "--chrome-flags=--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage",
    ]
    env = os.environ.copy()
    node = Path(r"C:\Program Files\nodejs")
    env["Path"] = str(node) + os.pathsep + env.get("Path", "")
    print("RUN", " ".join(cmd[:6]), url, "->", out_base.name, flush=True)
    proc = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True, shell=True)
    json_path = Path(str(out_base) + ".report.json")
    if not json_path.exists():
        json_path = out_base.with_suffix(".report.json")
    if not json_path.exists():
        candidates = list(out_base.parent.glob(out_base.name + "*json"))
        json_path = candidates[0] if candidates else json_path
    if proc.returncode != 0 and not json_path.exists():
        sys.stderr.write(proc.stdout + "\n" + proc.stderr + "\n")
        raise SystemExit(f"Lighthouse failed for {url} ({proc.returncode})")
    if proc.returncode != 0:
        sys.stderr.write("WARN lighthouse exit {0} but report exists\n".format(proc.returncode))
    if not json_path.exists():
        raise SystemExit(f"Missing JSON report for {url}: {list(out_base.parent.glob(out_base.name + '*'))}")
    return json_path


def summarize(phase: str, results: dict) -> dict:
    summary = {"phase": phase, "generatedAt": datetime.now(timezone.utc).isoformat(), "pages": {}}
    for slug, runs in results.items():
        perfs = [r["performance"] for r in runs]
        summary["pages"][slug] = {
            "runs": runs,
            "median": {
                "performance": median_int(perfs),
                "accessibility": median_int([r["accessibility"] for r in runs]),
                "bestPractices": median_int([r["bestPractices"] for r in runs]),
                "seo": median_int([r["seo"] for r in runs]),
                "lcp": median_int([r["lcp"] for r in runs]),
                "cls": median_float([r["cls"] for r in runs]),
                "tbt": median_int([r["tbt"] for r in runs]),
                "fcp": median_int([r["fcp"] for r in runs]),
                "si": median_int([r["si"] for r in runs]),
            },
            "causes": runs[0]["causes"] if runs else {},
        }
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", required=True, help="baseline or final")
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--only", default="", help="comma-separated slugs")
    args = parser.parse_args()
    chrome = CHROME
    if not chrome.exists():
        raise SystemExit(f"Chrome not found: {chrome}")
    slugs = [s.strip() for s in args.only.split(",") if s.strip()]
    pages = [p for p in PAGES if not slugs or p[0] in slugs]
    out_dir = ROOT / "reports" / "lighthouse" / "mobile" / args.phase
    out_dir.mkdir(parents=True, exist_ok=True)
    results: dict[str, list] = {}
    for slug, url in pages:
        results[slug] = []
        for i in range(1, args.runs + 1):
            base = out_dir / f"{slug}-run{i}"
            json_path = run_one(url, base, chrome)
            # Normalize filename if lighthouse appended .report
            report_json = out_dir / f"{slug}-run{i}.report.json"
            if not report_json.exists():
                candidates = list(out_dir.glob(f"{slug}-run{i}*json"))
                if candidates:
                    report_json = candidates[0]
                else:
                    report_json = json_path
            extracted = extract(report_json)
            extracted["slug"] = slug
            extracted["url"] = url
            extracted["run"] = i
            results[slug].append(extracted)
            print(
                f"  {slug} run{i}: perf={extracted['performance']} a11y={extracted['accessibility']} "
                f"bp={extracted['bestPractices']} seo={extracted['seo']} lcp={extracted['lcp']} "
                f"cls={extracted['cls']} tbt={extracted['tbt']}",
                flush=True,
            )
    summary = summarize(args.phase, results)
    summary_path = ROOT / "reports" / "lighthouse" / f"mobile_{args.phase}_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print("WROTE", summary_path)


if __name__ == "__main__":
    main()
