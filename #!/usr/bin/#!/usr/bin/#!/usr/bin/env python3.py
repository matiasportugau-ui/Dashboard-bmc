#!/usr/bin/env python3
import json
import random

KNOWLEDGE_FILE = "base_knowledge/knowledge.json"
OUTPUT_PRESET = "plugin_build/presets/generated_preset.json"

def load_knowledge():
    with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def simple_generation(genre, objective):
    knowledge = load_knowledge()
    # Example simple logic: pick random chain from knowledge for genre
    chains = knowledge.get("chains_by_genre", {}).get(genre, [])
    if not chains:
        chains = knowledge.get("default_chains", [])
    selected = random.choice(chains)
    preset = {
        "genre": genre,
        "objective": objective,
        "chain": selected
    }
    with open(OUTPUT_PRESET, "w", encoding="utf-8") as f:
        json.dump(preset, f, indent=2)
    print(f"Generated preset saved to {OUTPUT_PRESET}")

if __name__ == "__main__":
    # Example call
    simple_generation("electronic", "club_mix")