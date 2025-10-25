## Calendario de Vencimientos - Herramientas y flujo

Este repositorio contiene CSVs históricos en `Calendario de Vencimientos EVO/`. Agregamos herramientas para:

- Unificar y limpiar CSVs en un dataset normalizado
- Generar una plantilla Excel bonita para cargar datos
- Exportar un archivo `.ics` para importar al calendario (con alertas)
- Validar calidad de datos y emitir un reporte

### Archivos generados (en la raíz del repo)
- `Calendario_Vencimientos_Completo.xlsx`: consolidado normalizado
- `Plantilla_Calendario_Vencimientos.xlsx`: plantilla editable
- `Calendario_Vencimientos.ics`: calendario importable (incluye recordatorios a 3 y 1 días)
- `Vencimientos_Validacion.csv`: reporte de validación (filas con problemas detectados)

### Cómo correr localmente
1) Crear venv y dependencias (una sola vez):
```bash
cd /Users/matias/Documents/GitHub/Dashboard-bmc
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

2) Generar artefactos:
```bash
python3 scripts/vencimientos_tools.py \
  --dir "Calendario de Vencimientos EVO" \
  --out-excel "Plantilla_Calendario_Vencimientos.xlsx" \
  --out-excel-data "Calendario_Vencimientos_Completo.xlsx" \
  --out-ics "Calendario_Vencimientos.ics" \
  --out-report "Vencimientos_Validacion.csv" \
  --reminders 3 1
```

3) Solo la plantilla vacía:
```bash
python3 scripts/vencimientos_tools.py --template-only --out-excel "Plantilla_Calendario_Vencimientos.xlsx"
```

### Normalización de `estado`
Valores aceptados: `BORRADORES`, `PENDIENTE`, `PAGO`.
Se mapean variantes comunes (e.g., "en borradores", "pendiente de pago", "se debita (pago)") a estos valores.

### CI/CD
El workflow `.github/workflows/vencimientos-build.yml` regenera Excel/ICS cuando cambian los CSVs o el script, y commitea los resultados.

Si agregas estos secretos en el repositorio, sincroniza automáticamente con Google Calendar:
- `GCAL_CALENDAR_ID`: ID del calendario (puede ser tu email o el ID del calendario destino)
- EITHER `GCAL_SERVICE_ACCOUNT_JSON` (contenido JSON del Service Account con acceso al calendario)
- OR `GCAL_OAUTH_CLIENT_ID`, `GCAL_OAUTH_CLIENT_SECRET`, `GCAL_OAUTH_REFRESH_TOKEN`

Script de sincronización (manual/local):
```bash
python3 scripts/gcal_sync.py \
  --xlsx "Calendario_Vencimientos_Completo.xlsx" \
  --calendar-id "<tu_calendar_id>"
# Credenciales por env:
#   export GCAL_SERVICE_ACCOUNT_JSON='{"type": "service_account", ... }'
# o con OAuth refresh token:
#   export GCAL_OAUTH_CLIENT_ID=...
#   export GCAL_OAUTH_CLIENT_SECRET=...
#   export GCAL_OAUTH_REFRESH_TOKEN=...
```

### Consejos
- Fechas en formato `yyyy-mm-dd`.
- Usar `importe_uy` o `importe_usd` (al menos uno). 
- `alertas` para notas/flags.


