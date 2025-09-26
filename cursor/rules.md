## Reglas de colaboración (Cursor + GPT)

Estas reglas alinean el trabajo entre humanos y el asistente (IA) para un ciclo iterativo, seguro y eficaz.

### Principios
- Priorizar claridad, consistencia y seguridad.
- Preferir cambios pequeños y verificables.
- Automatizar tareas repetitivas; documentar decisiones importantes.

### Estilo de código
- Nombrado descriptivo y explícito. Evitar abreviaciones crípticas.
- Tipado estricto donde aplique (TS/pyright/mypy).
- Early returns y manejo explícito de errores.
- Sin comentarios triviales; documentar el "por qué".
- Respetar `.editorconfig`. No reformatear código no relacionado.

### Flujo de trabajo con IA
- Crear TODOs atómicos antes de implementar y marcarlos al terminar.
- Antes de editar un archivo, leerlo y validar el contexto.
- Actualizar linters y correr validaciones (`make check`).
- Referenciar código existente con bloques de referencia de líneas cuando sea necesario.

### Seguridad y secretos
- Nunca comprometer llaves o tokens. Usar variables de entorno.
- Mantener `.env.local` y plantillas `.env.example` sin secretos.
- Sanitizar logs y salidas automatizadas.

### Entornos y reproducibilidad
- Usar Dev Container por defecto.
- Scripts en `scripts/` deben ser idempotentes y no interactivos.

### PRs y CI
- Los PRs deben pasar `make check` y CI.
- Describir impacto, riesgos y plan de rollback.

