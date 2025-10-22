# Configuración de Cursor para el Entorno Code

Esta guía te ayudará a configurar Cursor IDE para trabajar óptimamente con el entorno Code y maximizar la colaboración con AI.

## 🎯 Configuración Básica de Cursor

### 1. Configuración del Workspace

Abrir Cursor en el directorio del entorno Code:

```bash
# Navegar al directorio
cd /path/to/code-env

# Abrir en Cursor
cursor .
```

### 2. Configurar Settings.json

Crear/editar `.vscode/settings.json` en tu workspace:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": [".", "projects/*"],
  "prettier.configPath": "./.prettierrc",
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.testing.pytestEnabled": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.env.example": "properties",
    ".cursor/*": "plaintext"
  },
  "cursor.ai.enabled": true,
  "cursor.ai.rules": ".cursor/rules",
  "cursor.ai.instructions": ".cursor/instructions"
}
```

### 3. Configurar Extensions.json

Crear `.vscode/extensions.json` para recomendar extensiones:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.flake8",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-html-language-features",
    "ms-vscode.vscode-css-language-features"
  ]
}
```

## 🤖 Configuración Específica para AI

### 1. Reglas de Cursor AI

Las reglas ya están configuradas en `.cursor/rules`. Puedes personalizarlas:

```bash
# Editar reglas
code .cursor/rules

# O usar Cursor
cursor .cursor/rules
```

### 2. Instrucciones Personalizadas

Personalizar `.cursor/instructions` según tus necesidades:

```markdown
# Mis Instrucciones Personalizadas

## Estilo de Código Preferido
- Usar arrow functions en JavaScript/TypeScript
- Preferir composition over inheritance
- Usar TypeScript strict mode

## Patrones de Diseño
- Implementar Repository pattern para APIs
- Usar Context API para estado global en React
- Aplicar SOLID principles

## Comentarios
- Documentar funciones complejas
- Usar JSDoc para APIs públicas
- Incluir ejemplos de uso
```

### 3. Shortcuts Personalizados

Configurar `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+c",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run create:project\n"
    }
  },
  {
    "key": "ctrl+shift+s",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run ai:sync\n"
    }
  },
  {
    "key": "ctrl+shift+d",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run deploy\n"
    }
  }
]
```

## 🛠️ Comandos de Cursor

### Comandos Personalizados

Crear `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Code Env: Setup",
      "type": "shell",
      "command": "npm",
      "args": ["run", "setup"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Code Env: Create Project",
      "type": "shell",
      "command": "npm",
      "args": ["run", "create:project"],
      "group": "build"
    },
    {
      "label": "Code Env: AI Sync",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ai:sync"],
      "group": "build"
    },
    {
      "label": "Code Env: Deploy",
      "type": "shell",
      "command": "npm",
      "args": ["run", "deploy"],
      "group": "build"
    },
    {
      "label": "Code Env: Lint All",
      "type": "shell",
      "command": "npm",
      "args": ["run", "lint"],
      "group": "test"
    },
    {
      "label": "Code Env: Test All",
      "type": "shell",
      "command": "npm",
      "args": ["run", "test"],
      "group": "test"
    }
  ]
}
```

## 🎨 Personalización de la Interfaz

### 1. Tema y Colores

Configurar tema específico para desarrollo con AI:

```json
{
  "workbench.colorTheme": "Dark+ (default dark)",
  "workbench.iconTheme": "vs-seti",
  "editor.tokenColorCustomizations": {
    "comments": "#6A9955",
    "keywords": "#569CD6",
    "strings": "#CE9178"
  }
}
```

### 2. Snippets Personalizados

Crear snippets para templates comunes en `.vscode/snippets/`:

**javascript.json:**
```json
{
  "Code Env React Component": {
    "prefix": "cerc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({ $3 }) => {",
      "  return (",
      "    <div>",
      "      $4",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "Create a React component for Code Environment"
  }
}
```

**python.json:**
```json
{
  "Code Env FastAPI Endpoint": {
    "prefix": "ceapi",
    "body": [
      "@app.${1:get}('/${2:endpoint}')",
      "async def ${3:function_name}($4) -> ${5:ResponseModel}:",
      "    \"\"\"",
      "    ${6:Description}",
      "    \"\"\"",
      "    try:",
      "        $7",
      "        return ${5:ResponseModel}($8)",
      "    except Exception as e:",
      "        raise HTTPException(status_code=500, detail=str(e))"
    ],
    "description": "Create a FastAPI endpoint for Code Environment"
  }
}
```

## 📊 Integración con AI Assistant

### 1. Comandos de AI

Usar estos comandos en Cursor para interactuar con el AI:

```
Ctrl+K - Chat con AI
Ctrl+L - Seleccionar código y preguntar
Ctrl+I - Generar código inline
```

### 2. Prompts Efectivos

**Para crear componentes:**
```
Crear un componente React para [funcionalidad] siguiendo las reglas del Code Environment. Incluir TypeScript types, props interface, y documentation.
```

**Para refactoring:**
```
Refactorizar este código siguiendo los estándares del Code Environment. Mejorar legibilidad, performance y mantenibilidad.
```

**Para debugging:**
```
Analizar este error en el contexto del Code Environment. Sugerir solución y mejores prácticas para evitarlo.
```

### 3. Sincronización Automática

Configurar auto-sync con AI:

```json
{
  "cursor.ai.autoSync": true,
  "cursor.ai.syncInterval": 300,
  "cursor.ai.contextFiles": [
    ".cursor/rules",
    ".cursor/instructions",
    "docs/context/*.json",
    "package.json",
    "config/environment.yaml"
  ]
}
```

## 🔧 Debugging y Desarrollo

### 1. Launch Configurations

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js Script",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Python Script",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}"
      }
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 2. Workspace Multi-Root

Para manejar múltiples proyectos, crear `code-env.code-workspace`:

```json
{
  "folders": [
    {
      "name": "Code Environment",
      "path": "."
    },
    {
      "name": "Projects",
      "path": "./projects"
    }
  ],
  "settings": {
    "cursor.ai.workspace": true,
    "files.exclude": {
      "**/node_modules": true,
      "**/.git": true,
      "**/venv": true
    }
  },
  "extensions": {
    "recommendations": [
      "ms-python.python",
      "esbenp.prettier-vscode",
      "dbaeumer.vscode-eslint"
    ]
  }
}
```

## 🚀 Productividad Máxima

### 1. Flujo de Trabajo Optimizado

1. **Inicio del día:**
   ```bash
   npm run ai:sync  # Sincronizar contexto
   ```

2. **Crear nuevo proyecto:**
   ```
   Ctrl+Shift+C  # Shortcut personalizado
   ```

3. **Desarrollo:**
   ```
   Ctrl+K  # Chat con AI para guidance
   ```

4. **Deployment:**
   ```
   Ctrl+Shift+D  # Shortcut personalizado
   ```

### 2. Comandos Útiles

**Terminal integrado:**
```bash
# Ver estado del entorno
npm run status

# Limpiar archivos temporales
npm run clean

# Ver templates disponibles
npm run templates
```

**AI Assistant:**
```
"Explica este código en el contexto del Code Environment"
"Sugiere mejoras siguiendo las reglas establecidas"
"Genera tests para esta función"
"Refactoriza siguiendo mejores prácticas"
```

## 📚 Recursos Adicionales

### Documentación
- `docs/README.md` - Documentación completa
- `.cursor/rules` - Reglas específicas
- `.cursor/instructions` - Instrucciones detalladas

### Logs y Debugging
- `logs/` - Todos los logs del sistema
- `npm run status` - Estado actual del entorno

### Comunidad
- GitHub Issues para reportar problemas
- Contribuir con nuevos templates
- Compartir configuraciones personalizadas

---

¡Con esta configuración, Cursor y el entorno Code trabajarán en perfecta armonía para maximizar tu productividad con AI! 🚀