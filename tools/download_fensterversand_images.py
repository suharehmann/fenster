#!/usr/bin/env python3
"""
Download fensterversand configurator preview images into the frontend public folder.

Workflow:
1. Fetch HTML (requests + BeautifulSoup) and collect <img> URLs
2. Download known material/product/window-type images from flyout URLs
3. Write data/fensterversand/download-manifest.json
4. Regenerate frontend/src/config/configuratorImages.js

Usage:
  pip install -r tools/requirements-scraper.txt
  python tools/download_fensterversand_images.py

Optional:
  python tools/download_fensterversand_images.py --url 'https://www.fensterversand.com/?cid=25&t=fenster-kunststoff'
  python tools/download_fensterversand_images.py --from-extracted data/fensterversand/extracted.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE = "https://www.fensterversand.com"
DEFAULT_URL = f"{BASE}/?cid=25&t=fenster-kunststoff"
IMG_ATTRS = ("data-srcset", "data-src", "data-fallback-src", "src")

# filename -> source URL (flyout assets used by the reference configurator)
DOWNLOAD_MAP: dict[str, str] = {
    "product-fenster.png": f"{BASE}/fileadmin/images/de/flyout/kunststofffenster.png",
    "product-door.png": f"{BASE}/fileadmin/images/de/flyout/haustuer-kunststoff.png",
    "product-shutter.png": f"{BASE}/fileadmin/images/de/flyout/aufsatzrollladen.png",
    "material-kunststoff.png": f"{BASE}/fileadmin/images/de/flyout/kunststofffenster.png",
    "material-kunststoff-alu.png": f"{BASE}/fileadmin/images/de/flyout/kunststoff-aluminium-fenster.png",
    "material-holz.png": f"{BASE}/fileadmin/images/de/flyout/holzfenster.png",
    "material-holz-alu.png": f"{BASE}/fileadmin/images/de/flyout/holz-alu-fenster.png",
    "material-aluminium.png": f"{BASE}/fileadmin/images/de/flyout/alufenster.png",
    "window-default.png": f"{BASE}/fileadmin/images/de/flyout/kunststofffenster.png",
    "window-balkontuer-einteilig.png": f"{BASE}/fileadmin/images/de/flyout/balkontueren-kunststoff_old.png",
    "window-balkontuer-zweiteilig.png": f"{BASE}/fileadmin/images/de/flyout/balkontuer-kunststoff-alu.png",
    "window-psk.png": f"{BASE}/fileadmin/images/de/flyout/psk-tuer.png",
    "window-hebeschiebe.png": f"{BASE}/fileadmin/images/de/flyout/hebeschiebetuer.png",
    "window-sondertyp.png": f"{BASE}/fileadmin/images/de/flyout/schiebefenster.png",
}

WINDOW_TYPE_FILES = {
    "Einteilig": "window-default.png",
    "Einteilig bodentief": "window-default.png",
    "Zweiteilig mit Stulp": "window-default.png",
    "Zweiteilig mit Pfosten": "window-default.png",
    "Dreiteilig": "window-default.png",
    "Dreiteilig bodentief": "window-default.png",
    "Vierteilig": "window-default.png",
    "Festverglasung rechteckig": "window-default.png",
    "Festverglasung bodentief": "window-default.png",
    "Balkontuer einteilig": "window-balkontuer-einteilig.png",
    "Balkontuer zweiteilig": "window-balkontuer-zweiteilig.png",
    "Parallel-Schiebe-Kipp": "window-psk.png",
    "Hebe-Schiebetuer": "window-hebeschiebe.png",
    "Rundbogen": "window-default.png",
    "Segmentbogen": "window-default.png",
    "Trapez": "window-default.png",
    "Dreieck": "window-default.png",
    "Sondertyp": "window-sondertyp.png",
}

MATERIAL_FILES = {
    "Kunststoff": "material-kunststoff.png",
    "Kunststoff-Aluminium": "material-kunststoff-alu.png",
    "Holz": "material-holz.png",
    "Holz-Aluminium": "material-holz-alu.png",
    "Aluminium": "material-aluminium.png",
}

PRODUCT_FILES = {
    "window": "product-fenster.png",
    "door": "product-door.png",
    "shutter": "product-shutter.png",
}


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def pick_srcset_url(value: str) -> str:
    """Use the largest candidate from a srcset attribute."""
    parts = [p.strip() for p in value.split(",") if p.strip()]
    if not parts:
        return value.strip()
    last = parts[-1].split()
    return last[0] if last else value.strip()


def image_url_from_tag(img, page_url: str) -> str | None:
    for attr in IMG_ATTRS:
        raw = img.get(attr)
        if not raw:
            continue
        link = pick_srcset_url(raw) if attr == "data-srcset" else raw.strip()
        if not link or link.startswith("data:"):
            continue
        return urljoin(page_url, link)
    return None


def collect_img_urls(html: str, page_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    urls: list[str] = []
    for img in soup.find_all("img"):
        link = image_url_from_tag(img, page_url)
        if link:
            urls.append(link)
    return urls


def download_file(session: requests.Session, url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    response = session.get(url, timeout=45)
    response.raise_for_status()
    dest.write_bytes(response.content)


def catalog_public_path(filename: str) -> str:
    return f"/assets/configurator/{filename}"


def write_frontend_manifest(public_dir: Path, manifest_json: Path) -> Path:
    js_path = repo_root() / "frontend/src/config/configuratorImages.js"

    window_manifest = {
        key: catalog_public_path(file)
        for key, file in WINDOW_TYPE_FILES.items()
        if (public_dir / file).exists()
    }
    material_manifest = {
        key: catalog_public_path(file)
        for key, file in MATERIAL_FILES.items()
        if (public_dir / file).exists()
    }
    product_manifest = {
        key: catalog_public_path(file)
        for key, file in PRODUCT_FILES.items()
        if (public_dir / file).exists()
    }

    lines = [
        "// Auto-generated by tools/download_fensterversand_images.py",
        "// Re-run the script after updating DOWNLOAD_MAP to refresh assets.",
        "",
        "export const CONFIGURATOR_IMAGE_BASE = '/assets/configurator';",
        "",
        "export function configuratorImage(filename) {",
        "  return `${CONFIGURATOR_IMAGE_BASE}/${filename}`;",
        "}",
        "",
        "export const PRODUCT_IMAGES = {",
    ]
    def js_key(name: str) -> str:
        return name if re.match(r"^[A-Za-z_]\w*$", name) else json.dumps(name, ensure_ascii=False)

    for key, file in PRODUCT_FILES.items():
        if key in product_manifest:
            lines.append(f"  {js_key(key)}: configuratorImage('{file}'),")
    lines.append("};")
    lines.append("")
    lines.append("export const MATERIAL_IMAGES = {")
    for key in MATERIAL_FILES:
        if key in material_manifest:
            lines.append(f"  {js_key(key)}: configuratorImage('{MATERIAL_FILES[key]}'),")
    lines.append("};")
    lines.append("")
    lines.append("export const WINDOW_TYPE_IMAGES = {")
    for key in WINDOW_TYPE_FILES:
        if key in window_manifest:
            lines.append(f"  {js_key(key)}: configuratorImage('{WINDOW_TYPE_FILES[key]}'),")
    lines.append("};")
    lines.append("")
    lines.append("export const OPTION_ICON_IMAGES = {")
    lines.append("  glass: configuratorImage('glass.svg'),")
    lines.append("  sound: configuratorImage('sound.svg'),")
    lines.append("  security: configuratorImage('security.svg'),")
    lines.append("  handle: configuratorImage('handle.svg'),")
    lines.append("  frame: configuratorImage('frame.svg'),")
    lines.append("};")
    lines.append("")
    lines.append("/** @deprecated Use PRODUCT_IMAGES */")
    lines.append("export const PRODUCT_IMAGE_MANIFEST = PRODUCT_IMAGES;")
    lines.append("/** @deprecated Use MATERIAL_IMAGES */")
    lines.append("export const MATERIAL_IMAGE_MANIFEST = MATERIAL_IMAGES;")
    lines.append("/** @deprecated Use WINDOW_TYPE_IMAGES */")
    lines.append("export const WINDOW_TYPE_IMAGE_MANIFEST = WINDOW_TYPE_IMAGES;")
    lines.append("")

    js_path.write_text("\n".join(lines), encoding="utf-8")
    manifest_json.write_text(
        json.dumps(
            {
                "product": product_manifest,
                "material": material_manifest,
                "windowType": window_manifest,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    return js_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--out", default="frontend/public/assets/configurator")
    parser.add_argument("--data-out", default="data/fensterversand")
    parser.add_argument("--from-extracted", default="")
    parser.add_argument("--skip-crawl", action="store_true")
    args = parser.parse_args()

    public_dir = repo_root() / args.out
    data_dir = repo_root() / args.data_out
    data_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            )
        }
    )

    crawled_urls: list[str] = []
    if not args.skip_crawl:
        html = session.get(args.url, timeout=45).text
        crawled_urls = collect_img_urls(html, args.url)
        (data_dir / "crawled-img-urls.json").write_text(
            json.dumps(sorted(set(crawled_urls)), indent=2),
            encoding="utf-8",
        )

    if args.from_extracted:
        extracted = json.loads(Path(args.from_extracted).read_text(encoding="utf-8"))
        crawled_urls.extend(extracted.get("image_urls", []))

    downloaded: dict[str, str] = {}
    errors: dict[str, str] = {}

    for filename, url in DOWNLOAD_MAP.items():
        dest = public_dir / filename
        try:
            download_file(session, url, dest)
            downloaded[filename] = url
            print(f"OK  {filename}")
        except Exception as exc:  # noqa: BLE001
            errors[filename] = str(exc)
            print(f"ERR {filename}: {exc}")

    manifest_path = data_dir / "download-manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "source": args.url,
                "downloaded": downloaded,
                "errors": errors,
                "crawled_url_count": len(set(crawled_urls)),
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    js_path = write_frontend_manifest(public_dir, data_dir / "image-manifest.json")
    print(f"\nSaved {len(downloaded)} images to {public_dir}")
    print(f"Manifest: {manifest_path}")
    print(f"Frontend: {js_path}")


if __name__ == "__main__":
    main()
