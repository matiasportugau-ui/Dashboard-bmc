## AI Workspace

Este directorio contiene materiales para handoff de tareas a la IA y operación iterativa.

### Estructura
- `tasks/`: Tareas atómicas y bien definidas para que la IA ejecute.
- `runbooks/`: Procedimientos y flujos repetibles (deploy, migraciones, etc.).
- `prompts/`: Prompts de sistema/rol/estilo reusables.

### Convenciones
- Cada tarea debe incluir: contexto, objetivo, criterios de aceptación, riesgos y artefactos esperados.
- Usa referencias a archivos con rutas absolutas dentro del repo.
- Evita dependencias externas no declaradas.

