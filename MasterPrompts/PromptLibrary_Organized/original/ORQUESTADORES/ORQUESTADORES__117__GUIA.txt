# Guía — RCT‑COE vFinal (v1.2 + PEIPM‑50)
- **Roles**: PLN, RSR, BLD, CRT, INT, OPS, SAFE, AU1, AU2.
- **Pipeline**: F0 Estudio → F1 Planificación → F2 50 ciclos (PLN→RSR→BLD→CRT→INT→OPS→SAFE) → F3 Cierre.
- **AU Protocol**: INT arbitra entre AU1/AU2; CRT puntúa 0–1; SAFE puede vetar.
- **Gates**: seguridad ≥ 0.995, robustez ≥ 0.85, score ≥ 0.8.
- **Reproducibilidad**: semilla fija, registro JSONL de ciclos.
- **Modo desarrollo continuo**: repetir F2 con nuevos datos; mantener gates.

## Operación
1. Actualizá fuentes/datasets → lanzar F2 (50 ciclos).
2. Revisá `LOG_PEIPM50.jsonl` y `CHANGELOG_50.md`.
3. Verificá `MATRIZ_EVIDENCIA.json` y `REPORTE_RECURSOS.json`.
4. Entregá `VERSION_FINAL.json` + `GUIA.md` al cierre.

## Métricas finales
- Score final: 0.872193
- Δscore total: 0.020863
- Gates OK: True
- Seguridad: 1.0 · Robustez: 0.9400000000000001
