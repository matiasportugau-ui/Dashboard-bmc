import json
import datetime
import os

#!/usr/bin/env python3

LOG_FILE = "logs/audit_history.json"

def load_log():
    if not os.path.exists(LOG_FILE):
        # Ensure the logs directory exists
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        return []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_log(entries):
    # Ensure the logs directory exists before saving
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2)

def log_phase(phase, status, details=None):
    entries = load_log()
    entry = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "phase": phase,
        "status": status,
        "details": details or {}
    }
    entries.append(entry)
    save_log(entries)
    print(f"[AUDIT] Phase: {phase} — Status: {status}")

if __name__ == "__main__":
    # Example usage
    log_phase("Phase1_Preparation", "started", {"note": "Initial run"})