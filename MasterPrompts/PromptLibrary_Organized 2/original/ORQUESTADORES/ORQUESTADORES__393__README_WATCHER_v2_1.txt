
# Prompt Library Watcher v2.1 — Organizador en carpeta maestra

## Qué hace
- Observa múltiples rutas (archivos y carpetas).
- Clasifica (categoría, tipos, tags) y **organiza** todo dentro de una **carpeta maestra**.
- Estructura final: `{root}/{categoria}/{tipos}/{nombre_canonico}`
- Crea sidecars: `.capabilities.md`, `.upgrade_log.md`, `.meta.json` junto al archivo organizado.
- Mantiene `index.json` global en `{root}/_artifacts/` con todo el historial.
- (Opcional) Llama al orquestador PEIPM-50 (modo API) para generar `library_index.json`, `workflows.json`, `changelog_peipm.json`, `guia_integracion.md`.

## Uso rápido
### DRY-RUN (sin API, organiza moviendo)
```bash
python prompt_library_watcher_v2_1.py \
  --paths ~/Prompts:~/Docs/Prompts \
  --root-master ~/MasterPrompts \
  --organize move \
  --include "*.txt,*.md,*.json" \
  --exclude "*_tmp*,*.bak,*/.git/*,*/node_modules/*"
```

### API real (con orquestador)
```bash
export OPENAI_API_KEY="sk-..."
python prompt_library_watcher_v2_1.py \
  --paths ~/Prompts \
  --mode API \
  --orchestrator orchestrator_system_prompt.txt \
  --root-master ~/MasterPrompts \
  --organize move
```

## Notas
- `--organize copy` deja el original y copia el organizado a la carpeta maestra.
- El patrón de nombre canónico: `{categoria}__{tipos}__{titulo-resumido}__v1.0__{lang}.prompt.md`.
- Editá `orchestrator_system_prompt.txt` si querés cambiar los entregables.
