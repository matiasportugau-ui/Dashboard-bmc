#!/usr/bin/env python3
"""Inventory generator for Ableton project assets."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List

PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = PROJECT_ROOT / "input_files"
OUTPUT_FILE = INPUT_DIR / "inventory.json"
EXCLUDE_SUFFIXES = {".DS_Store", ".tmp", ".bak"}


def iter_files(path: Path) -> Iterable[Path]:
    for candidate in sorted(path.rglob("*")):
        if not candidate.is_file():
            continue
        if candidate.suffix in EXCLUDE_SUFFIXES:
            continue
        # Skip hidden files and directories
        if any(part.startswith(".") for part in candidate.relative_to(path).parts):
            continue
        yield candidate


def scan_directory(path: Path) -> List[Dict[str, object]]:
    inventory: List[Dict[str, object]] = []
    for file_path in iter_files(path):
        stat = file_path.stat()
        inventory.append(
            {
                "file": str(file_path.relative_to(path)),
                "size_bytes": stat.st_size,
                "extension": file_path.suffix.lower(),
            }
        )
    return inventory


def main() -> None:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    inventory = scan_directory(INPUT_DIR)
    OUTPUT_FILE.write_text(json.dumps(inventory, indent=2), encoding="utf-8")
    print(f"Inventory written to {OUTPUT_FILE.relative_to(PROJECT_ROOT)}, total files: {len(inventory)}")


if __name__ == "__main__":
    main()
