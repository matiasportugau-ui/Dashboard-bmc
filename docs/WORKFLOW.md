## Workflow humano-IA en Cursor

### Setup
1. Abre el repo en Cursor y usa el Dev Container.
2. Ejecuta `make setup` y luego `make check`.

### Ciclo de trabajo
1. Define TODOs atómicos y prioriza.
2. Para cada TODO:
   - Lee el código relevante.
   - Implementa cambios mínimos.
   - Ejecuta `make check` local.
   - Abre PR con impacto y riesgos.
3. Merge tras CI en verde.

### Buenas prácticas en prompts
- Proveer contexto: archivos, funciones, endpoints.
- Expresar criterios de aceptación.
- Solicitar validación con linters y tests.

