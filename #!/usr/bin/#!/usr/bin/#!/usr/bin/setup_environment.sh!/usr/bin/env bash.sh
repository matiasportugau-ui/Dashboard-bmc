setup_environment.sh!/usr/bin/env bash
# setup_environment.sh — crea la estructura de carpetas y archivos iniciales

# Ruta base del proyecto
BASE_DIR="project-audio-chains"

echo "✅ Creando estructura de carpetas en ${BASE_DIR} …"

# Crear carpetas principales
mkdir -p "${BASE_DIR}/input_files"
mkdir -p "${BASE_DIR}/extracted_terms"
mkdir -p "${BASE_DIR}/base_knowledge"
mkdir -p "${BASE_DIR}/scripts"
mkdir -p "${BASE_DIR}/plugin_build/presets"
mkdir -p "${BASE_DIR}/plugin_build/release"
mkdir -p "${BASE_DIR}/docs"
mkdir -p "${BASE_DIR}/logs"

echo "✅ Carpetas creadas."

# Crear archivos plantilla mínimos
cat > "${BASE_DIR}/scripts/scan_inputs.py" << 'EOF'
#!/usr/bin/env python3
import os
import json

INPUT_DIR = "input_files"
OUTPUT_FILE = os.path.join(INPUT_DIR, "inventory.json")

def scan_directory(path):
    inventory = []
    for root, dirs, files in os.walk(path):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), path)
            inventory.append({
                "file": rel,
                "size_bytes": os.path.getsize(os.path.join(root, f)),
                "extension": os.path.splitext(f)[1].lower()
            })
    return inventory

def main():
    inv = scan_directory(INPUT_DIR)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(inv, f, indent=2)
    print(f"Inventory written to {OUTPUT_FILE}, total files: {len(inv)}")

if __name__ == "__main__":
    main()
EOF

cat > "${BASE_DIR}/scripts/audit_log.py" << 'EOF'
#!/usr/bin/env python3
import json
import datetime
import os

LOG_FILE = "logs/audit_history.json"

def load_log():
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_log(entries):
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
EOF

cat > "${BASE_DIR}/scripts/generation_engine.py" << 'EOF'
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
    chains = knowledge.get("chains_by_genre", {}).get(genre, [])
    if not chains:
        chains = knowledge.get("default_chains", [])
    selected = random.choice(chains) if chains else {}
    preset = {
        "genre": genre,
        "objective": objective,
        "chain": selected
    }
    with open(OUTPUT_PRESET, "w", encoding="utf-8") as f:
        json.dump(preset, f, indent=2)
    print(f"Generated preset saved to {OUTPUT_PRESET}")

if __name__ == "__main__":
    simple_generation("electronic", "club_mix")
EOF

echo "[]" > "${BASE_DIR}/logs/audit_history.json"

cat > "${BASE_DIR}/docs/best_practices_initial.md" << 'EOF'
# Mejores Prácticas Iniciales

Este documento contendrá una investigación preliminar de mejores prácticas en producción de audio (mezcla, mastering, cadenas de señal estándar, etc.).  
EOF

cat > "${BASE_DIR}/docs/best_practices_final.md" << 'EOF'
# Mejores Prácticas Finales

Aquí se documentarán las mejores prácticas seleccionadas para implementar en el sistema, junto con criterios de calidad cuantificables.  
EOF

cat > "${BASE_DIR}/docs/engine_spec.md" << 'EOF'
# Especificación Técnica del Motor de Generación

## Entradas  
- género  
- objetivo sonoro  
- plantilla base  

## Salidas  
- cadena de señal  
- preset/configuración exportable  

## Lógica  
(…)  
EOF

cat > "${BASE_DIR}/docs/user_manual.md" << 'EOF'
# Manual de Usuario

Instrucciones de instalación y uso del plugin/preset para Ableton Live.  
EOF

cat > "${BASE_DIR}/maintenance_plan.md" << 'EOF'
# Plan de Mantenimiento y Evolución

## Versión  
v1.0

## Objetivo  
Garantizar que el sistema evolucione continuamente con nuevas entradas, mejores prácticas y métricas.

## Cadencia  
- Cada **30 días** revisar:
  - Nuevos archivos agregados a `input_files/`
  - Nuevas mejores prácticas del mercado
  - Resultados del plugin/preset en producción y feedback de usuarios

## Acciones  
1. Ejecutar `scripts/audit_log.py` para registrar el estado actual y compararlo con ejecuciones anteriores.  
2. Añadir nuevos términos a `base_knowledge/knowledge.json` si se detectan en `extracted_terms/terms_raw.csv`.  
3. Ajustar reglas en `generation_engine.py` según métricas de calidad o feedback recogido.  
4. Generar nueva versión del plugin/preset en `plugin_build/release/`.  
5. Actualizar `version.txt` y `changelog.md` con los cambios realizados.

## Indicadores de Mejora  
- Reducción del tiempo de configuración del usuario un 5 % por versión.  
- Cobertura de base de conocimiento ≥ 95 % de los términos nuevos detectados.  
- Feedback de usuarios ≥ 4,5/5 en calidad sonora y usabilidad.

## Registro de Cambios  
Ver `changelog.md`.  
EOF

cat > "${BASE_DIR}/changelog.md" << 'EOF'
# Changelog

## v1.0 – Fecha de inicio  
- Creación de estructura de carpetas y archivos iniciales.  
- Scripts básicos generados.  
- Esquema inicial de `knowledge.json` establecido.  
- Plan de mantenimiento documentado.  
EOF

echo "v1.0" > "${BASE_DIR}/version.txt"

echo "✅ Archivos plantilla creados."
echo "✅ Entorno inicial listo."
echo "Por favor, sube tus archivos de Ableton Live (plantillas, presets, cadenas de señal, metadatos) en la carpeta: ${BASE_DIR}/input_files/"