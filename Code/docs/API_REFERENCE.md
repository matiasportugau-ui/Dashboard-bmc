# API Reference - Code Development Environment

## 📚 Tabla de Contenidos

- [GPT Client](#gpt-client)
- [Cursor Client](#cursor-client)
- [Integration Manager](#integration-manager)
- [Automation Orchestrator](#automation-orchestrator)
- [Template Generator](#template-generator)

## GPT Client

### Importación
```javascript
const GPTClient = require('./integrations/gpt/client');
const client = new GPTClient(apiKey);
```

### Métodos

#### `chat(messages, options)`
Envía mensajes a GPT y recibe respuestas.

**Parámetros:**
- `messages` (Array): Array de mensajes con formato `{role, content}`
- `options` (Object): Opciones adicionales
  - `temperature` (Number): Control de creatividad (0-1)
  - `maxTokens` (Number): Límite de tokens
  - `stream` (Boolean): Habilitar streaming

**Ejemplo:**
```javascript
const response = await client.chat([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello!' }
], { temperature: 0.7 });
```

#### `generateCode(prompt, language, context)`
Genera código basado en un prompt.

**Parámetros:**
- `prompt` (String): Descripción del código a generar
- `language` (String): Lenguaje de programación
- `context` (String): Contexto adicional opcional

**Retorna:** Array de bloques de código

**Ejemplo:**
```javascript
const code = await client.generateCode(
  'Create a function to sort an array',
  'javascript',
  'Use modern ES6+ syntax'
);
```

#### `analyzeCode(code, analysisType)`
Analiza código y proporciona insights.

**Parámetros:**
- `code` (String): Código a analizar
- `analysisType` (String): Tipo de análisis
  - `'general'`: Análisis general
  - `'security'`: Análisis de seguridad
  - `'performance'`: Análisis de rendimiento
  - `'refactoring'`: Sugerencias de refactoring

**Retorna:** Objeto con análisis estructurado

**Ejemplo:**
```javascript
const analysis = await client.analyzeCode(
  sourceCode,
  'security'
);
console.log(analysis.issues);
```

#### `suggestImprovements(code, requirements)`
Sugiere mejoras específicas para el código.

**Parámetros:**
- `code` (String): Código actual
- `requirements` (String): Requisitos de mejora

**Retorna:** Objeto con código mejorado y explicaciones

## Cursor Client

### Importación
```javascript
const CursorClient = require('./integrations/cursor/client');
const client = new CursorClient();
```

### Métodos

#### `syncFile(filePath, content)`
Sincroniza un archivo con Cursor.

**Parámetros:**
- `filePath` (String): Ruta del archivo
- `content` (String): Contenido del archivo

**Retorna:** Objeto con estado de sincronización

**Ejemplo:**
```javascript
const result = await client.syncFile(
  'src/components/Button.jsx',
  buttonComponentCode
);
```

#### `syncDirectory(dirPath, options)`
Sincroniza un directorio completo.

**Parámetros:**
- `dirPath` (String): Ruta del directorio
- `options` (Object): Opciones de sincronización
  - `exclude` (Array): Patrones a excluir
  - `includeOnly` (Array): Solo incluir estos patrones

**Ejemplo:**
```javascript
const result = await client.syncDirectory('src/', {
  exclude: ['node_modules', '.git'],
  includeOnly: ['*.js', '*.jsx']
});
```

#### `executeCommand(command, options)`
Ejecuta un comando en el contexto de Cursor.

**Parámetros:**
- `command` (String): Comando a ejecutar
- `options` (Object): Opciones
  - `cwd` (String): Directorio de trabajo
  - `timeout` (Number): Timeout en ms

#### `watchForChanges(callback)`
Observa cambios en el workspace de Cursor.

**Parámetros:**
- `callback` (Function): Función llamada en cada cambio

**Ejemplo:**
```javascript
const watcher = await client.watchForChanges((event) => {
  console.log(`File ${event.file} was ${event.type}`);
});
```

## Integration Manager

### Importación
```javascript
const IntegrationManager = require('./integrations');
const manager = new IntegrationManager();
```

### Métodos

#### `coordinate(action, params)`
Coordina acciones entre integraciones.

**Acciones disponibles:**
- `'generateAndSync'`: Genera código y sincroniza
- `'analyzeAndImprove'`: Analiza y mejora código
- `'bidirectionalSync'`: Sincronización bidireccional

**Ejemplo:**
```javascript
const result = await manager.coordinate('generateAndSync', {
  prompt: 'Create a REST API endpoint',
  language: 'javascript',
  targetPath: 'src/api/users.js'
});
```

#### `setupWebhooks()`
Configura webhooks para integraciones.

**Retorna:** Instancia de Express app

**Ejemplo:**
```javascript
const app = await manager.setupWebhooks();
// Webhooks disponibles en:
// POST /webhook/gpt
// POST /webhook/cursor
```

## Automation Orchestrator

### Importación
```javascript
const AutomationOrchestrator = require('./automation/orchestrator');
const orchestrator = new AutomationOrchestrator();
```

### Métodos

#### `initialize()`
Inicializa el orchestrator.

```javascript
await orchestrator.initialize();
```

#### `executeTask(taskName, data)`
Ejecuta una tarea específica.

**Parámetros:**
- `taskName` (String): Nombre de la tarea
- `data` (Object): Datos para la tarea

**Tareas disponibles:**
- `'sync-gpt'`: Sincronización con GPT
- `'sync-cursor'`: Sincronización con Cursor
- `'code-analysis'`: Análisis de código
- `'template-generator'`: Generación de templates

**Ejemplo:**
```javascript
const result = await orchestrator.executeTask('code-analysis', {
  targetDirectory: 'src/',
  outputFormat: 'json'
});
```

### Eventos

El orchestrator emite los siguientes eventos:

- `sync:gpt`: Trigger sincronización con GPT
- `sync:cursor`: Trigger sincronización con Cursor
- `analyze:code`: Trigger análisis de código
- `generate:template`: Trigger generación de template
- `{taskName}:complete`: Tarea completada
- `{taskName}:error`: Error en tarea

**Ejemplo de uso con eventos:**
```javascript
orchestrator.on('sync:gpt:complete', (result) => {
  console.log('GPT sync completed:', result);
});

orchestrator.emit('sync:gpt', { manual: true });
```

## Template Generator

### Uso desde CLI
```bash
node scripts/generate-template.js <template> <name> [options]
```

### Templates Disponibles

#### `react-component`
Genera un componente React completo.

**Archivos generados:**
- `Component.jsx`: Componente principal
- `Component.css`: Estilos
- `Component.test.js`: Tests
- `index.js`: Export

**Ejemplo:**
```bash
npm run generate:template react-component Button -- -o src/components
```

#### `node-api`
Genera una API REST en Node.js.

**Archivos generados:**
- `controller.js`: Controlador
- `service.js`: Lógica de negocio
- `routes.js`: Rutas Express

**Ejemplo:**
```bash
npm run generate:template node-api User -- -o src/api
```

#### `python-class`
Genera una clase Python con tests.

**Archivos generados:**
- `__init__.py`: Module init
- `class.py`: Clase principal
- `test.py`: Tests con pytest

### Agregar Templates Personalizados

```javascript
const { addTemplate } = require('./automation/tasks/template-generator');

await addTemplate('custom-template', {
  files: {
    'main.js': 'console.log("{{name}}");',
    'README.md': '# {{name}}\n\n{{description}}'
  }
});
```

## 🔐 Autenticación y Seguridad

### Variables de Entorno Requeridas

```env
# GPT
OPENAI_API_KEY=sk-...

# Cursor
CURSOR_WORKSPACE_PATH=/absolute/path
CURSOR_PROJECT_ID=unique-id

# Webhooks
WEBHOOK_SECRET=secure-random-string
```

### Validación de Webhooks

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature) {
  const hash = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

## 🚨 Manejo de Errores

Todos los métodos pueden lanzar errores. Se recomienda usar try-catch:

```javascript
try {
  const result = await client.generateCode(prompt);
} catch (error) {
  if (error.response?.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}
```

## 📊 Límites y Cuotas

### GPT API
- Rate limit: 3 RPM (tier básico)
- Max tokens por request: 8000
- Max context window: 128k (GPT-4 Turbo)

### Sincronización
- Max archivos por sincronización: 1000
- Max tamaño de archivo: 1MB
- Intervalo mínimo: 10 segundos

## 🔄 Versionado

La API sigue versionado semántico. Breaking changes solo en major versions.

Version actual: 1.0.0

---

Para más ejemplos y casos de uso, consulta la carpeta `/examples` en el repositorio.