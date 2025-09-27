# Historial de cambios — BMC Slip Pro

## v2.1.0 — 2025‑09‑07

- **Plantilla final PEIPM‑50**: integración del slip A4 y térmico con chips/ribbons, zebra rows y secciones de control de calidad/picking.
- **Modo compacto ‘térmica’**: activable mediante el tag `termica` para impresoras de 80 mm (≈ 384 px).
- **Variables CSS**: definidas en `:root` para facilitar el cambio de colores y estilos.
- **Fallback QR**: variable `use_png_qr` que permite usar un QR en formato PNG base64 cuando una impresora no soporta SVG inline.
- **Carpeta `analytics`**: añade archivos `PEC_result.json` y `BAEM.json` con los resultados de la evaluación del slip y la autoauditoría del evaluador.
- **Documentación ampliada**: README revisado con instrucciones de instalación, impresión y análisis.

## v2.0.0 — 2025‑09‑06

- Primera versión estable basada en el marco multi‑agente v2.1.0, con slip bilingüe, control de calidad, chips dinámicos y disposición responsiva.
- Separación de estilos y lógica; inclusión de guías de impresión A4 y térmica.
- Empaquetado inicial como producto digital.

---

<!--
EXPORT_SEAL v1
project: BMC Slip Pro Package
prompt_id: changelog
version: 2.1.0
file: product/docs/CHANGELOG.md
lang: markdown
created_at: 2025-09-07T00:00:00Z
author: Equipo Multi‑Agente
origin: chatgpt
body_sha256: e7c6df4cd421ae0f1717fd23f0e49a0e5bf69cb9a7cb51b784437a9849018758
notes: Historial de cambios del slip premium y documentación.
-->