## Code — Entorno de desarrollo asistido por IA

Repositorio base para crear, automatizar y escalar proyectos con ayuda de agentes (GPT/Cursor). Incluye convenciones, tooling de calidad y CI para trabajar de forma iterativa entre humanos y agentes.

### Qué incluye
- **JS/TS**: TypeScript, ESLint, Prettier, estructura `src/`.
- **Python**: Ruff, Black, pre-commit.
- **Automatización**: GitHub Actions para lint/typecheck, Dependabot.
- **Reproducibilidad**: Dev Container con Node 20 y Python 3.11.
- **Agentes**: Reglas en `.cursor/` y playbook en `docs/`.
- **Scaffolding**: scripts para Next.js y FastAPI.

### Requisitos
- Node.js >= 18 (recomendado 20)
- Python >= 3.11
- Git
- Docker + Dev Containers (opcional pero recomendado)

### Instalación rápida
```bash
# JS/TS
yarn || npm install
npm run typecheck
npm run lint

# Python (herramientas)
python3 -m pip install -U pip ruff black pre-commit
pre-commit install
pre-commit run --all-files
```

### Scripts (npm)
- `npm run dev`: ejecutar `src/index.ts` en watch (requiere `tsx`).
- `npm run build`: compilar a `dist/` con TypeScript.
- `npm run typecheck`: verificación de tipos sin emitir.
- `npm run lint`: ESLint sobre JS/TS.
- `npm run format`: Prettier sobre el repo.

### Estructura sugerida
- `.cursor/` reglas del agente y `.cursorignore` para minimizar ruido.
- `.devcontainer/` configuración del entorno reproducible.
- `.github/` CI y plantillas de issues/PR.
- `scripts/` utilidades de scaffolding.
- `src/` utilidades compartidas (JS/TS).
- `docs/` documentación y playbooks.

### Agentes y trabajo iterativo
- Lee `.cursor/rules.md` para alinearte con las reglas del agente.
- Sigue `docs/agent-playbook.md` para flujos de trabajo (scaffolding, pruebas, CI).
- Mantén cambios pequeños y frecuentes para feedback rápido del agente.

### CI
- Lint y typecheck para JS/TS.
- Lint Python (ruff/black) y verificación de hooks de pre-commit.
- Dependabot para mantener dependencias al día.

### Dev Container
- Abre el repo con Dev Containers. Se instalarán Node 20 y Python 3.11.
- Configura postCreate para instalar dependencias JS y herramientas Python.

### Scaffolding
- `scripts/scaffold-next.sh`: crea un proyecto Next.js pre-configurado.
- `scripts/scaffold-fastapi.sh`: crea un microservicio FastAPI base.

### Convenciones
- Código claro y explícito, sin abreviaturas crípticas.
- Reglas de linters no se desactivan sin justificación en PR.
- CI debe pasar en cada PR antes de merge. 
