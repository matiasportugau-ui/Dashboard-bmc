# Make AI Agent — Quickstart (≤5 min)

## Pasos
1) **AI Agents → Create agent**: pegá `make_agent_prompt.txt` en *Instructions*.
2) **Output**: creá un *Structured response* con los campos de `output_schema.json`.
3) **Context**: subí (si tenés) tus CSV/Sheets de catálogo, márgenes y diccionario campañas↔SKU.
4) **Router (rápido)**: escenario con:
   - *Webhook* (trigger),
   - *Run an agent* (usá el agente creado),
   - *Parse JSON* (del campo output),
   - *Switch/Router* por `actions[*].scenario` → log o llama sub-escenarios.
5) **Probar**: usá `sample_input.json` (texto del campo "message") y verificá que te devuelva JSON válido.

> Modo seguro: mantené `require_confirmation=true` y aprobá manualmente en el Router las acciones críticas.

## Siguientes 5-15 min
- Conectar ingestas (Google Ads, Meta, Shopify, Meli, GBP) y volcar a tu Data Store KPI.
- Añadir validaciones de stock/márgenes antes de ejecutar acciones.

<!-- EXPORT_SEAL v1
project: PROMPT MAKER
prompt_id: make_agent_5min_readme
version: 1.0
file: README_QUICKSTART.md
lang: md
created_at: 2025-09-16T04:27:04Z
author: GPT-5 Thinking
origin: respuesta_chat
body_sha256: TBD
notes: Guía en 5 minutos para crear el agente y router
-->
