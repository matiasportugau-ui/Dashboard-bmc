## Code: Entorno de desarrollo asistido por IA (Cursor + GPT)

Este repositorio es la base para crear servicios, apps y automatizaciones en un flujo de trabajo iterativo con IA (Cursor + GPT). Incluye un entorno reproducible, reglas de colaboración con el asistente, automatización de tareas y CI para mantener calidad técnica.

### Objetivos
- Estandarizar cómo trabajamos con IA y entre humanos.
- Proveer tooling listo: Dev Container, linters, formatters, hooks, CI.
- Facilitar handoff de tareas a la IA con un espacio `ai/` y reglas en `cursor/rules.md`.

### Estructura
- `ai/`: Espacio de trabajo de IA (runbooks, prompts, tareas).
- `docs/`: Guías de workflow humano-IA y configuración de Cursor.
- `.devcontainer/`: Entorno de desarrollo reproducible (Node + Python).
- `scripts/`: Automatizaciones para lint/format/test.
- `.github/workflows/`: CI para validaciones.

### Requisitos
- Docker (para Dev Containers) o dependencias locales (Node 20, Python 3.11).
- Cursor o VS Code (opcional pero recomendado con Dev Containers).

### Primeros pasos
1. Abrir el repo en Cursor y usar Dev Container.
2. Ejecutar los comandos de verificación:
   - `make setup`
   - `make check`

### Comandos principales (Makefile)
- `make setup`: Instala herramientas de desarrollo (pre-commit, linters).
- `make lint`: Ejecuta linters (Python + JS/TS si aplica).
- `make format`: Formatea el código.
- `make test`: Ejecuta pruebas de Python y/o JS/TS si existen.
- `make check`: Lint + Test + Validaciones rápidas.

### Reglas del asistente
Lee y mantén `cursor/rules.md`. Ahí están las convenciones de estilo, límites y responsabilidades del asistente.

### CI
Ver `.github/workflows/ci.yml`. Corre lint y tests automáticamente en PRs.

### Seguridad
- No subir secretos. Usa variables de entorno y `.env.local` (ignorados).
- Revisa `docs/WORKFLOW.md` para prácticas seguras en prompts y automatizaciones.

# Code

Base monorepo para automatización con GPT/Code y Cursor.

## Quickstart

- Requisitos: Node 18+, pnpm 9+
- Instalar: pnpm i
- Checks: pnpm lint && pnpm typecheck
- Formatear: pnpm format

## Estructura

- src/: código de ejemplo y plantillas
- ai/: prompts, system, evaluaciones
- docs/: runbooks y decisiones (ADR)
- scripts/: utilidades de CI/local
- .github/workflows/: CI mínima

## Handoff con AI

- Definir contextos en ai/system/\*.md
- Mantener .cursorignore actualizado
- Usar tasks en scripts para automatizar flujos
