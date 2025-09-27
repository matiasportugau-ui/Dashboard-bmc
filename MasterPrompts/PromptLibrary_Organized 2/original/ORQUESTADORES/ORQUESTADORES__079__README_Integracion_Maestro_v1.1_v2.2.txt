# Integración Maestro v1.1 + Encadenamiento v2.2
**ID:** MAESTRO-INTEG-1122 · **Versión:** v1.1+v2.2 · **Fecha:** 2025-09-06T08:31:39Z

Este paquete enlaza el **Prompt Maestro v1.1** (Foto→Pack) con el **Encadenamiento Multi-IA v2.2** (patrón **P2_dual_split**).

## Cómo usar (modo rápido)
1. Colocá tus fotos en: `input/fotos/` (p.ej. frente.jpg, espalda.jpg).
2. Ejecutá (modo dry-run por defecto):  
   ```bash
   python maestro_pipeline_entry.py --images input/fotos/frente.jpg input/fotos/espalda.jpg --talle M --ancho_tela 150 --dry-run
   ```
3. Verás el plan en `output/dry_run_plan.json`. Para ejecución real, quitá `--dry-run` cuando conectes tus herramientas/modelos.

## Qué hace
- **P2_dual_split**: `IMG` y `FIT` en **paralelo** → `DAT` → `CRT` (gate KPIs) → rama correctiva si falla → `PAT` + `BLD` → marcadores/consumo → **AU1/AU2** si hay conflicto → `INT` → empaquetado.
- **KPIs**: calidad≥0.90; estabilidad≥0.92; cobertura=100%.
- **Early-stop**: delta<0.01 por 2 ciclos → detener y registrar motivo.
- **Determinismo**: `seed=1337` y orden fijo.

## Carpetas
- `input/` (tus imágenes) · `output/` (resultados) · `config/` (JSONs) · `docs/` (DAG/Protocolos) · `logs/`.

<!-- === EXPORT_SEAL v1 ===
project: Integración Maestro v1.1 + Encadenamiento v2.2
prompt_id: MAESTRO-INTEG-1122
version: v1.1+v2.2
file: README_Integracion_Maestro_v1.1_v2.2.md
lang: md
created_at: 2025-09-06T08:31:39Z
author: Usuario
origin: chatgpt
body_sha256: TBD
notes: generado por política universal de sello
=== /EXPORT_SEAL === -->
