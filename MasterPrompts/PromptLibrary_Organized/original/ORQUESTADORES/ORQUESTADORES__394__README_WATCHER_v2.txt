
# Prompt Library Watcher v2 — "Levanta de todos lados"

## ¿Qué agrega la v2?
- **Múltiples rutas** y **glob include/exclude** para controlar qué levanta.
- **Evaluación/Clasificación local** (categoría, tipos de tarea, tags).
- **Explicación de capacidades** (`.capabilities.md`) junto al archivo original.
- **Log de mejoras** (`.upgrade_log.md`) listo para que el orquestador lo tome.
- **Sugerencia de nombre canónico** (`.meta.json` con `canonical_suggestion`).
- **Ledger central** (`_artifacts/index.json`) con todo lo descubierto.

## Ejemplos
### DRY-RUN
```bash
python prompt_library_watcher_v2.py \
  --paths ~/Prompts:~/Docs/Prompts \
  --include "*.txt,*.md,*.json" \
  --exclude "*_tmp*,*.bak,*/node_modules/*,*/.git/*" \
  --mode DRY-RUN
```

### API real
```bash
export OPENAI_API_KEY="sk-..."
python prompt_library_watcher_v2.py \
  --paths ~/Prompts \
  --mode API \
  --orchestrator orchestrator_system_prompt.txt \
  --artifacts ~/Prompts/_artifacts
```

## Naming pattern sugerido
`{categoria}__{tipos}__{titulo-resumido}__v1.0__{lang}.prompt.md`  
**Ejemplo:**  
`automatizacion__codigo-research__orquestador-multi-agente__v1.0__es.prompt.md`

## Sidecars generados
- `ARCHIVO.capabilities.md` — breve explicación para interpretar el prompt.
- `ARCHIVO.upgrade_log.md` — mejoras/extensiones sugeridas (upgrade-ready).
- `ARCHIVO.meta.json` — categoría, tipos, tags, idioma y nombre canónico sugerido.

## Ledger central
`_artifacts/index.json` acumula entradas con: ruta, categoría, tipos, tags, nombre sugerido y timestamp.
