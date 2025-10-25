
# Organizer Simple — Sin flags

## 1) Copiar archivos
- Copiá `prompt_organizer_simple.py` a una carpeta (ej. `~/Documents/Bibliteca de Prompts Viva/`).

## 2) Correr
```bash
/usr/bin/python3 ~/Documents/Bibliteca\ de\ Prompts\ Viva/prompt_organizer_simple.py
# o
python3 ~/Documents/Bibliteca\ de\ Prompts\ Viva/prompt_organizer_simple.py
```

## Qué hace
- Escanea: `~/Prompts`, `~/Documents/Prompts`, `~/Desktop/Prompts`, `~/Downloads/Prompts` y, si existen, `/Volumes/*/Prompts`.
- Mueve todo a `~/MasterPrompts/{categoria}/{tipo}/NOMBRE_CANONICO.prompt.md`.
- Genera sidecars junto al archivo: `.capabilities.md`, `.upgrade_log.md`, `.meta.json`.
- Mantiene índice global en `~/MasterPrompts/_artifacts/index.json`.

> Si querés cambiar carpetas de origen o extensiones, editá las listas al comienzo del script.
