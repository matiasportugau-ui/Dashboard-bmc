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
