#!/usr/bin/env python3
"""
Crawler utility for fensterversand configurator assets.

What it does:
- Fetches entry HTML
- Collects linked JS/CSS files
- Extracts candidate image URLs
- Extracts opening-pattern-like codes (DKL, DKR, F, etc.)
- Extracts color-like labels from JS payload

Usage:
  python tools/crawl_fensterversand.py \
    --url 'https://www.fensterversand.com/?cid=25&t=fenster-kunststoff' \
    --out data/fensterversand

Note:
- Requires internet/DNS access in your runtime.
- Respect site terms before automated crawling.
- To download flyout preview PNGs into the frontend, run:
  pip install -r tools/requirements-scraper.txt
  python tools/download_fensterversand_images.py
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

SCRIPT_RE = re.compile(r"<script[^>]+src=['\"]([^'\"]+)['\"]", re.IGNORECASE)
LINK_RE = re.compile(r"<link[^>]+href=['\"]([^'\"]+)['\"]", re.IGNORECASE)
IMG_URL_RE = re.compile(r"https?://[^\s'\"()]+\.(?:png|jpg|jpeg|webp|svg)", re.IGNORECASE)
OPENING_CODE_RE = re.compile(r"\b(?:F|K|DL|DR|DKL|DKR|S)(?:-(?:F|K|DL|DR|DKL|DKR|S)){0,3}\b")
COLOR_LABEL_RE = re.compile(r"\b(?:anthrazit|weiss|nussbaum|golden\s*oak|quarzgrau|basaltgrau|schwarz|grau|winchester)\b", re.IGNORECASE)


def fetch_text(session: requests.Session, url: str) -> str:
    response = session.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def safe_filename_from_url(url: str) -> str:
    path = urlparse(url).path.strip("/")
    if not path:
        return "index"
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    out_dir = Path(args.out)
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        }
    )

    html = fetch_text(session, args.url)
    (raw_dir / "page.html").write_text(html, encoding="utf-8")

    soup = BeautifulSoup(html, "html.parser")
    asset_urls: set[str] = set()

    for script in soup.find_all("script", src=True):
        asset_urls.add(urljoin(args.url, script["src"]))
    for link in soup.find_all("link", href=True):
        href = link["href"]
        if any(href.lower().endswith(ext) for ext in (".css", ".js")):
            asset_urls.add(urljoin(args.url, href))

    # Fallback regex parse in case dynamic attributes are used.
    for src in SCRIPT_RE.findall(html):
        asset_urls.add(urljoin(args.url, src))
    for href in LINK_RE.findall(html):
        if any(href.lower().endswith(ext) for ext in (".css", ".js")):
            asset_urls.add(urljoin(args.url, href))

    payloads: list[dict[str, str]] = []
    for asset_url in sorted(asset_urls):
        try:
            text = fetch_text(session, asset_url)
        except Exception as exc:
            payloads.append({"url": asset_url, "error": str(exc)})
            continue

        filename = safe_filename_from_url(asset_url)
        (raw_dir / filename).write_text(text, encoding="utf-8", errors="ignore")
        payloads.append({"url": asset_url, "file": f"raw/{filename}"})

    corpus = "\n".join([
        html,
        *(Path(raw_dir / p["file"].split("raw/")[-1]).read_text(encoding="utf-8", errors="ignore")
          for p in payloads if "file" in p),
    ])

    image_urls = sorted(set(IMG_URL_RE.findall(corpus)))
    opening_codes = sorted(set(OPENING_CODE_RE.findall(corpus)))
    color_labels = sorted(set(label.lower() for label in COLOR_LABEL_RE.findall(corpus)))

    result = {
        "source": args.url,
        "assets": payloads,
        "image_urls": image_urls,
        "opening_codes": opening_codes,
        "color_labels": color_labels,
    }

    (out_dir / "extracted.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Saved to: {out_dir / 'extracted.json'}")
    print(f"Assets: {len(payloads)} | Images: {len(image_urls)} | Codes: {len(opening_codes)} | Colors: {len(color_labels)}")


if __name__ == "__main__":
    main()
