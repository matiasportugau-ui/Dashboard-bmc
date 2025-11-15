# Configuración de Cursor para el Entorno Code

Esta guía te ayudará a configurar Cursor para trabajar de manera óptima con el entorno Code.

## 📋 Requisitos

- Cursor instalado (versión más reciente)
- Node.js v16+
- Acceso a las API keys necesarias

## 🚀 Configuración Inicial

### 1. Configurar el Workspace

1. Abre Cursor
2. Ve a `File > Open Folder` y selecciona la carpeta del proyecto Code
3. Cursor detectará automáticamente la configuración del proyecto

### 2. Instalar Extensiones Recomendadas

Instala las siguientes extensiones en Cursor para una mejor experiencia:

- **ESLint**: Para linting de código JavaScript/TypeScript
- **Prettier**: Para formateo automático de código
- **GitLens**: Para mejor integración con Git
- **Code Spell Checker**: Para detectar errores ortográficos
- **Path Intellisense**: Para autocompletado de rutas

### 3. Configuración de Settings

Agrega estas configuraciones a tu `settings.json` de Cursor:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.env.linux": {
    "NODE_ENV": "development"
  }
}
```

## 🔧 Configuración de Sincronización

### 1. Variables de Entorno

Asegúrate de que el archivo `.env` en la raíz del proyecto Code contenga:

```env
CURSOR_WORKSPACE_PATH=/ruta/absoluta/a/este/proyecto
CURSOR_PROJECT_ID=code-development-env
```

### 2. Configuración de Auto-Sincronización

Para habilitar la sincronización automática:

```env
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_MS=30000  # Sincronizar cada 30 segundos
```

### 3. Iniciar el Sistema de Sincronización

En la terminal de Cursor:

```bash
npm run automation:start
```

Esto iniciará el orchestrator que manejará la sincronización automática.

## 🎯 Flujos de Trabajo

### Sincronización Manual

Para sincronizar manualmente con GPT:
```bash
npm run sync:cursor
```

### Generar Código desde Templates

Usa los comandos de generación directamente desde la terminal de Cursor:

```bash
# Generar un componente React
npm run generate:template react-component Header

# Generar una API en Node.js
npm run generate:template node-api Products

# Generar una clase Python
npm run generate:template python-class DataManager
```

### Análisis de Código

Para analizar el código actual:
```bash
npm run analyze
```

## 🔄 Integración con GPT

### Configurar Comentarios Especiales

Puedes usar comentarios especiales que serán detectados por el sistema de sincronización:

```javascript
// CURSOR: Este código necesita optimización
// TODO: Implementar validación de entrada
// AI: Sugerir mejoras para este algoritmo
```

### Comandos Rápidos

Crea estos snippets en Cursor para acceso rápido:

1. **Sincronizar con GPT**
   ```
   Prefix: sync-gpt
   Body: npm run sync:gpt
   ```

2. **Generar Template**
   ```
   Prefix: gen-template
   Body: npm run generate:template $1 $2
   ```

3. **Analizar Archivo Actual**
   ```
   Prefix: analyze-file
   Body: npm run analyze -- --file $TM_FILEPATH
   ```

## 🛠️ Personalización

### Agregar Nuevos Templates

1. Edita `automation/tasks/template-generator.js`
2. Agrega tu template al objeto `templates`
3. Reinicia el orchestrator

### Configurar Hooks de Git

Para sincronizar automáticamente en cada commit:

```bash
# En .git/hooks/pre-commit
#!/bin/bash
npm run sync:cursor
```

## 🐛 Solución de Problemas

### Cursor no detecta cambios

1. Verifica que el watcher esté activo:
   ```bash
   ps aux | grep orchestrator
   ```

2. Revisa los logs:
   ```bash
   tail -f logs/cursor-client.log
   ```

### Error de permisos

Asegúrate de que Cursor tenga permisos de lectura/escritura:
```bash
chmod -R 755 /workspace/Code
```

### Sincronización lenta

Ajusta el intervalo de sincronización en `.env`:
```env
SYNC_INTERVAL_MS=60000  # Aumentar a 60 segundos
```

## 📊 Monitoreo

### Ver Estado de Sincronización

```bash
cat sync-state.json | jq .
```

### Dashboard de Métricas

Próximamente: Dashboard web para visualizar métricas en tiempo real.

## 🎨 Temas y Apariencia

Recomendamos estos temas para mejor visualización del código:

- **One Dark Pro**: Tema oscuro profesional
- **Material Theme**: Diseño material moderno
- **Dracula Official**: Alto contraste

## 🔐 Seguridad

1. **Nunca** commitees el archivo `.env`
2. Usa variables de entorno para datos sensibles
3. Revisa regularmente los logs de acceso
4. Mantén las dependencias actualizadas

## 📚 Recursos Adicionales

- [Documentación de Cursor](https://cursor.sh/docs)
- [Guía de ESLint](https://eslint.org/docs/user-guide/getting-started)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

Para más ayuda, consulta el README principal o abre un issue en el repositorio.