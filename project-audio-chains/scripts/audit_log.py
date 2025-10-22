#!/usr/bin/env python3
"""Simple audit log writer for mastering workflow automation."""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LOG_FILE = PROJECT_ROOT / "logs" / "audit_history.json"
ISO_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"


@dataclass
class AuditEntry:
    phase: str
    status: str
    details: Dict[str, Any]
    timestamp: str

    @classmethod
    def create(cls, phase: str, status: str, details: Optional[Dict[str, Any]] = None) -> "AuditEntry":
        return cls(
            phase=phase,
            status=status,
            details=details or {},
            timestamp=datetime.utcnow().strftime(ISO_FORMAT),
        )


def _ensure_parent() -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)


def load_log() -> List[Dict[str, Any]]:
    _ensure_parent()
    if not LOG_FILE.exists():
        return []
    return json.loads(LOG_FILE.read_text(encoding="utf-8"))


def save_log(entries: List[Dict[str, Any]]) -> None:
    _ensure_parent()
    LOG_FILE.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def log_phase(phase: str, status: str, details: Optional[Dict[str, Any]] = None) -> AuditEntry:
    entries = load_log()
    entry = AuditEntry.create(phase=phase, status=status, details=details)
    entries.append(asdict(entry))
    save_log(entries)
    print(f"[AUDIT] Phase: {phase} — Status: {status}")
    return entry


def latest_entry() -> Optional[Dict[str, Any]]:
    entries = load_log()
    if not entries:
        return None
    return entries[-1]


if __name__ == "__main__":
    log_phase("Phase1_Preparation", "started", {"note": "Manual test run"})
