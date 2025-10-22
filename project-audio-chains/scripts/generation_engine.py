#!/usr/bin/env python3
"""Preset generator that combines knowledge base chains into Ableton-ready JSON."""
from __future__ import annotations

import argparse
import json
import random
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_FILE = PROJECT_ROOT / "base_knowledge" / "knowledge.json"
OUTPUT_DIR = PROJECT_ROOT / "plugin_build" / "presets"
DEFAULT_OBJECTIVE = "balanced"


def load_knowledge() -> Dict[str, Any]:
    if not KNOWLEDGE_FILE.exists():
        raise FileNotFoundError(f"Knowledge file not found: {KNOWLEDGE_FILE}")
    return json.loads(KNOWLEDGE_FILE.read_text(encoding="utf-8"))


def _objective_tags(chain: Dict[str, Any]) -> List[str]:
    return [tag.lower() for tag in chain.get("objective_tags", [])]


def _matches_objective(chain: Dict[str, Any], objective: str) -> bool:
    objective_lower = objective.lower()
    return objective_lower in _objective_tags(chain)


def select_chain(knowledge: Dict[str, Any], genre: str, objective: Optional[str]) -> Dict[str, Any]:
    objective = (objective or DEFAULT_OBJECTIVE).lower()
    chains = knowledge.get("chains_by_genre", {}).get(genre, [])

    if chains:
        objective_matches = [chain for chain in chains if _matches_objective(chain, objective)]
        if objective_matches:
            chains = objective_matches

    if not chains:
        defaults = knowledge.get("default_chains", [])
        default_matches = [chain for chain in defaults if _matches_objective(chain, objective)]
        chains = default_matches or defaults

    if not chains:
        available = ", ".join(sorted(knowledge.get("chains_by_genre", {}).keys()))
        raise ValueError(f"No chains defined for genre '{genre}'. Available genres: {available or 'none'}")

    return random.choice(chains)


def _detailed_signal_chain(chain: Dict[str, Any], module_catalog: Dict[str, Any]) -> List[Dict[str, Any]]:
    detailed: List[Dict[str, Any]] = []
    for stage in chain.get("signal_chain", []):
        module_id = stage.get("module_id")
        module_meta = module_catalog.get(module_id, {})
        detailed.append(
            {
                "order": stage.get("order"),
                "module_id": module_id,
                "module_name": module_meta.get("name"),
                "category": module_meta.get("category"),
                "purpose": stage.get("notes"),
                "recommended_settings": module_meta.get("default_parameters", {}),
                "stage_settings": stage.get("settings", {}),
            }
        )
    return detailed


def build_preset(
    knowledge: Dict[str, Any],
    chain: Dict[str, Any],
    genre: str,
    objective: Optional[str],
    seed: Optional[int],
) -> Dict[str, Any]:
    module_catalog = knowledge.get("module_catalog", {})
    metering_fallback = knowledge.get("metering_targets", {}).get(genre)
    preset = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "generation_seed": seed,
        "genre": genre,
        "objective": objective or DEFAULT_OBJECTIVE,
        "chain_id": chain.get("id"),
        "chain_name": chain.get("name"),
        "source_signal_path_id": chain.get("source_signal_path_id"),
        "description": chain.get("description"),
        "signal_chain": _detailed_signal_chain(chain, module_catalog),
        "macro_snapshot": chain.get("macro_snapshot", {}),
        "metering": chain.get("metering") or metering_fallback,
        "post_checks": chain.get("post_checks", []),
        "reference_tracks": chain.get("reference_tracks", []),
    }
    return preset


def _sanitize_filename(value: str) -> str:
    return "".join(char if char.isalnum() or char in {"-", "_"} else "-" for char in value.lower())


def write_preset(preset: Dict[str, Any]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    slug_components = [preset["genre"], preset.get("objective") or DEFAULT_OBJECTIVE, preset.get("chain_id", "chain")]
    slug = "_".join(filter(None, map(_sanitize_filename, slug_components)))
    output_path = OUTPUT_DIR / f"{slug}.json"
    output_path.write_text(json.dumps(preset, indent=2), encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Ableton mastering preset JSON from knowledge base.")
    parser.add_argument("--genre", default="electronic", help="Genre key to use (matches knowledge base).")
    parser.add_argument("--objective", default=None, help="Optional objective tag (e.g., club_mix, balanced).")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed for reproducibility.")
    parser.add_argument("--dry-run", action="store_true", help="Print preset instead of writing to disk.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.seed is not None:
        random.seed(args.seed)

    knowledge = load_knowledge()
    chain = select_chain(knowledge, args.genre, args.objective)
    preset = build_preset(knowledge, chain, args.genre, args.objective, args.seed)

    if args.dry_run:
        print(json.dumps(preset, indent=2))
        return

    output_path = write_preset(preset)
    print(f"Preset written to {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
