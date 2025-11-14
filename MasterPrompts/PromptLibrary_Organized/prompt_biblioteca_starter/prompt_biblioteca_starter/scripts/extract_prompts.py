from __future__ import annotations
import re, json, pathlib
from typing import List, Dict

MANIFEST = "config/harvest_manifest.yaml"  # ajusta si fuera necesario

PROMPT_HINTS = [
    r"^Sistema\b", r"^System\b", r"^Eres un\b", r"^You are a\b",
    r"^Instrucciones\b", r"^Instructions\b", r"```(md|markdown|text)?",
    r"\[\[PROMPT\]\]", r"^#\s*Prompt", r"\bPlantilla\b"
]
HINT_RE = re.compile("|".join(PROMPT_HINTS), re.IGNORECASE | re.MULTILINE)

def read_manifest(path: str) -> Dict:
    import yaml
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def load_text(p: str) -> str:
    return pathlib.Path(p).read_text(encoding="utf-8", errors="ignore")

def segment_candidates(text: str) -> List[str]:
    blocks = re.split(r"\n\s*\n", text)
    return [b.strip() for b in blocks if HINT_RE.search(b or "")]

def to_draft(obj_id: str, seg: str, chat_id: str, seg_idx: int) -> Dict:
    # Placeholder normalization básica
    plantilla = seg
    plantilla = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+", "<EMAIL>", plantilla)
    plantilla = re.sub(r"(sk-[A-Za-z0-9]{20,})", "<API_KEY_***>", plantilla)
    return {
        "id_sugerido": f"p_auto_{seg_idx:03d}",
        "titulo": "Auto-extraído",
        "tipo": [],
        "plantilla": plantilla,
        "variables": [],
        "seguridad": ["Anonimizar PII", "No revelar razonamiento oculto"],
        "evidencias": [f"{chat_id}#seg_{seg_idx}"],
        "ejemplo_uso": {"input": "", "output_stub": ""},
        "tags": [],
        "notas": "Heurístico; revisar y completar con DAN extractor"
    }

def main():
    manifest = read_manifest(MANIFEST)
    drafts_all = []
    for src in manifest["sources"]:
        chat_id = src["id"]
        text = load_text(src["path"])
        cands = segment_candidates(text)
        for i, seg in enumerate(cands, start=1):
            drafts_all.append(to_draft(src["id"], seg, chat_id, i))
    out = {
        "version": "1.0",
        "prompts_draft": drafts_all
    }
    pathlib.Path(manifest["out"]["drafts_json"]).parent.mkdir(parents=True, exist_ok=True)
    with open(manifest["out"]["drafts_json"], "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[OK] Escrito {manifest['out']['drafts_json']} con {len(drafts_all)} borradores.")

if __name__ == "__main__":
    main()

# EXPORT_SEAL v1
# project: Automatismos VMC
# prompt_id: SCRIPT_EXTRACT_PROMPTS
# version: v1
# file: scripts/extract_prompts.py
# lang: python
# created_at: 2025-09-16T00:00:00Z
# author: @matias.portugau
# origin: Librería agnóstica — heurístico + hook LLM
# body_sha256: TBD
