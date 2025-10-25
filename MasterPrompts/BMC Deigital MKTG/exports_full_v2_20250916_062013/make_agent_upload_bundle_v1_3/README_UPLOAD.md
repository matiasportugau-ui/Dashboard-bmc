# Make AI Agent — Upload Bundle (v1.3)

Subí los archivos así:
1) System prompt → `system_prompt_make.txt` (AI Agents → tu agente → System prompt).
2) Structured response → creá los campos con `output_schema.json`.
3) Context → subí: `targets.json`, `catalog.csv`, `margins.csv`, `campaign_map.csv`, `competition_sources.csv`, `kpi_dictionary.md`.
4) Tools → usá `system_tools_contracts.json` como guía para parámetros de tus escenarios.

Notas:
- Empezá con `require_confirmation=true` para ACT-*.
- TZ: America/Montevideo · Moneda: UYU.
- Actualizá `catalog.csv`/`margins.csv` cuando cambien precios/stock.
- Recomendado: Webhook (Instant Trigger) para despachos y Data Stores para KPI Mart.
