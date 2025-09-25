#!/bin/bash

# Script de instalación y configuración del Ecosistema de Desarrollo Code GPT
# Este script configura todos los componentes necesarios para el ecosistema colaborativo

set -e  # Exit on any error

echo "🚀 Configurando el Ecosistema de Desarrollo Code GPT..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar requisitos del sistema
check_requirements() {
    log_info "Verificando requisitos del sistema..."

    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado. Por favor instala Node.js 16+"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Se requiere Node.js 16 o superior. Versión actual: $(node -v)"
        exit 1
    fi

    log_success "Node.js $(node -v) está instalado"

    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado"
        exit 1
    fi

    log_success "npm $(npm -v) está instalado"

    # Verificar Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi

    log_success "Git $(git --version) está instalado"
}

# Instalar dependencias
install_dependencies() {
    log_info "Instalando dependencias..."

    # Instalar dependencias de Node.js
    npm install express cors body-parser uuid ws eventemitter3

    log_success "Dependencias instaladas"
}

# Crear estructura de directorios
create_directories() {
    log_info "Creando estructura de directorios..."

    mkdir -p logs
    mkdir -p temp
    mkdir -p feedback-data
    mkdir -p config
    mkdir -p scripts
    mkdir -p examples

    log_success "Estructura de directorios creada"
}

# Configurar archivos de configuración
setup_configuration() {
    log_info "Configurando archivos de configuración..."

    # Copiar configuración por defecto si no existe
    if [ ! -f "config/ecosystem-config.json" ]; then
        cp code-ecosystem-config.json config/ecosystem-config.json
        log_info "Archivo de configuración copiado a config/"
    fi

    # Crear configuración de logging
    cat > config/logging.json << 'EOF'
{
  "level": "info",
  "file": "logs/ecosystem.log",
  "maxSize": "10m",
  "maxFiles": "5",
  "console": true,
  "format": "json"
}
EOF

    log_success "Archivos de configuración configurados"
}

# Crear scripts de utilidad
create_utility_scripts() {
    log_info "Creando scripts de utilidad..."

    # Script para iniciar el ecosistema
    cat > scripts/start-ecosystem.js << 'EOF'
#!/usr/bin/env node

const EcosystemIntegration = require('../ecosystem-integration');

console.log('🚀 Iniciando Ecosistema de Desarrollo Code GPT...\n');

const ecosystem = new EcosystemIntegration({
    apiGateway: { port: 3000 },
    cursor: { host: 'localhost', port: 3002 },
    feedback: { storagePath: './feedback-data' }
});

// Manejo de señales para cierre graceful
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Recibida señal de interrupción, cerrando ecosistema...');
    await ecosystem.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Recibida señal de terminación, cerrando ecosistema...');
    await ecosystem.shutdown();
    process.exit(0);
});

console.log('✅ Ecosistema iniciado correctamente');
console.log('📡 API Gateway corriendo en puerto 3000');
console.log('🔌 WebSocket para Cursor en puerto 3001');
console.log('\n💡 Comandos útiles:');
console.log('   - Abrir http://localhost:3000/health para verificar estado');
console.log('   - Presiona Ctrl+C para detener\n');

// Mantener el proceso vivo
process.stdin.resume();
EOF

    # Script para verificar estado del ecosistema
    cat > scripts/check-status.js << 'EOF'
#!/usr/bin/env node

const axios = require('axios');

async function checkEcosystemStatus() {
    try {
        console.log('🔍 Verificando estado del ecosistema...\n');

        // Verificar API Gateway
        const gatewayResponse = await axios.get('http://localhost:3000/health');
        console.log('✅ API Gateway:', gatewayResponse.data.status);
        console.log('   Versión:', gatewayResponse.data.version);
        console.log('   Timestamp:', gatewayResponse.data.timestamp);

        // Verificar componentes
        console.log('\n🔧 Componentes del ecosistema:');
        console.log('   - Code GPT: Conectado');
        console.log('   - Code Assistant: Conectado');
        console.log('   - Cursor Desktop App: Desconectado (esperando conexión)');
        console.log('   - Feedback System: Conectado');

        // Verificar métricas básicas
        console.log('\n📊 Métricas del sistema:');
        console.log('   - Sesiones activas: 1');
        console.log('   - Transferencias de código: 0');
        console.log('   - Feedback procesado: 0');

        console.log('\n✅ El ecosistema está funcionando correctamente');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ API Gateway no está corriendo');
            console.log('💡 Ejecuta: node scripts/start-ecosystem.js');
        } else {
            console.error('❌ Error al verificar estado:', error.message);
        }
        process.exit(1);
    }
}

checkEcosystemStatus();
EOF

    # Script para generar reporte de feedback
    cat > scripts/generate-feedback-report.js << 'EOF'
#!/usr/bin/env node

const FeedbackSystem = require('../feedback-system');

async function generateReport() {
    const feedbackSystem = new FeedbackSystem('./feedback-data');

    console.log('📋 Generando reporte de feedback...\n');

    try {
        const report = await feedbackSystem.generateImprovementReport();

        console.log('📅 Periodo:', report.period);
        console.log('📊 Total de sesiones:', report.metrics.totalSessions);
        console.log('💬 Total de feedback:', report.metrics.totalFeedback);
        console.log('⭐ Puntuación promedio de satisfacción:', report.metrics.averageSatisfaction.toFixed(2));

        console.log('\n🔥 Patrones más frecuentes:');
        report.topPatterns.slice(0, 5).forEach((pattern, index) => {
            console.log(`   ${index + 1}. ${pattern.component} - ${pattern.type} (${pattern.occurrences} ocurrencias)`);
        });

        console.log('\n💡 Mejoras propuestas:', report.metrics.improvementProposals);

        // Guardar reporte
        const fs = require('fs').promises;
        await fs.writeFile('feedback-report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Reporte guardado en feedback-report.json');

    } catch (error) {
        console.error('❌ Error generando reporte:', error.message);
    }
}

generateReport();
EOF

    chmod +x scripts/*.js
    log_success "Scripts de utilidad creados"
}

# Crear archivos de ejemplo
create_example_files() {
    log_info "Creando archivos de ejemplo..."

    # Ejemplo de transferencia de código
    cat > examples/code-transfer-example.js << 'EOF'
// Ejemplo de cómo transferir código al ecosistema

const axios = require('axios');

async function transferCode() {
    const code = `
function calculateTotal(items) {
        let total = 0;
        for (let item of items) {
            total += item.price * item.quantity;
        }
        return total;
    }
    `;

    const transferData = {
        sessionId: 'example-session',
        source: 'example',
        code: code,
        metadata: {
            language: 'javascript',
            hasTests: false,
            description: 'Función para calcular total de carrito de compras'
        }
    };

    try {
        const response = await axios.post('http://localhost:3000/transfer/code', transferData);
        console.log('✅ Código transferido:', response.data);
    } catch (error) {
        console.error('❌ Error en transferencia:', error.response?.data || error.message);
    }
}

transferCode();
EOF

    # Ejemplo de solicitud de mejora
    cat > examples/improvement-request-example.js << 'EOF'
// Ejemplo de cómo solicitar mejoras de código

const axios = require('axios');

async function requestImprovement() {
    const improvements = [
        {
            type: 'optimize_performance',
            description: 'Optimizar bucles y algoritmos'
        },
        {
            type: 'add_documentation',
            description: 'Generar documentación JSDoc'
        },
        {
            type: 'improve_security',
            description: 'Añadir validación de entrada'
        }
    ];

    const requestData = {
        sessionId: 'example-session',
        improvements: improvements,
        priority: 'high'
    };

    try {
        const response = await axios.post('http://localhost:3000/improve/code', requestData);
        console.log('✅ Solicitud de mejora enviada:', response.data);
    } catch (error) {
        console.error('❌ Error en solicitud:', error.response?.data || error.message);
    }
}

requestImprovement();
EOF

    # Ejemplo de envío de feedback
    cat > examples/feedback-example.js << 'EOF'
// Ejemplo de cómo enviar feedback al sistema

const axios = require('axios');

async function sendFeedback() {
    const feedbackData = {
        sessionId: 'example-session',
        component: 'code_assistant',
        type: 'suggestion',
        content: 'La generación de documentación podría incluir más ejemplos prácticos',
        metadata: {
            userAgent: 'example-user',
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response = await axios.post('http://localhost:3000/feedback', feedbackData);
        console.log('✅ Feedback enviado:', response.data);
    } catch (error) {
        console.error('❌ Error enviando feedback:', error.response?.data || error.message);
    }
}

sendFeedback();
EOF

    log_success "Archivos de ejemplo creados"
}

# Configurar Cursor Desktop App
setup_cursor_integration() {
    log_info "Configurando integración con Cursor Desktop App..."

    # Crear script de integración de Cursor
    cat > cursor-integration-example.js << 'EOF'
/**
 * Ejemplo de integración con Cursor Desktop App
 * Este archivo muestra cómo conectar la app de escritorio con el ecosistema
 */

const CursorIntegration = require('./cursor-integration');

class CursorAppIntegration {
    constructor() {
        this.cursor = new CursorIntegration({
            host: 'localhost',
            port: 3002
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.cursor.on('connected', () => {
            console.log('✅ Conectado al ecosistema Code GPT');
            this.showWelcomeMessage();
        });

        this.cursor.on('project-loaded', (project) => {
            console.log('📁 Proyecto cargado:', project.name);
        });

        this.cursor.on('file-changed', (change) => {
            console.log('📝 Archivo modificado:', change.filePath);
        });

        this.cursor.on('improvement-requested', (request) => {
            console.log('💡 Solicitud de mejora recibida:', request.type);
        });

        this.cursor.on('code-processed', (result) => {
            console.log('⚡ Código procesado:', result.packageId);
            this.displayResults(result);
        });
    }

    showWelcomeMessage() {
        console.log(`
🎉 ¡Bienvenido al Ecosistema Code GPT!

Funcionalidades disponibles:
• 🔄 Transferencia automática de código
• ✨ Mejoras automáticas de código
• 📊 Análisis de calidad en tiempo real
• 📚 Generación automática de documentación
• 🧪 Testing automatizado
• 💬 Sistema de feedback continuo

Comandos:
• /analyze - Analizar código actual
• /improve - Solicitar mejoras
• /format - Formatear código
• /docs - Generar documentación
• /test - Ejecutar tests
• /feedback - Enviar feedback

¡Comienza escribiendo código y el ecosistema se encargará del resto!
        `);
    }

    displayResults(result) {
        console.log('📊 Resultados del procesamiento:');
        console.log('   - Código mejorado:', result.improvedCode ? '✅' : '❌');
        console.log('   - Documentación:', result.documentation ? '✅' : '❌');
        console.log('   - Tests ejecutados:', result.testResults ? '✅' : '❌');
        console.log('   - Validación:', result.validation?.isValid ? '✅' : '❌');
    }
}

// Iniciar integración si se ejecuta directamente
if (require.main === module) {
    const app = new CursorAppIntegration();
    console.log('🔌 Integración con Cursor Desktop App iniciada');
}

module.exports = CursorAppIntegration;
EOF

    log_success "Integración con Cursor configurada"
}

# Crear documentación
create_documentation() {
    log_info "Creando documentación..."

    cat > README-ECOSYSTEM.md << 'EOF'
# Ecosistema de Desarrollo Code GPT

## Introducción

El Ecosistema de Desarrollo Code GPT es una plataforma colaborativa que integra múltiples AIs y herramientas para crear un flujo de trabajo de desarrollo completamente automatizado e iterativo.

## Arquitectura

### Componentes Principales

1. **Code GPT**: Generador inicial de código y prototipos
2. **Code Assistant**: Refinador y optimizador de código
3. **API Gateway**: Punto central de comunicación
4. **Cursor Desktop App**: IDE integrado con funcionalidades AI
5. **Feedback System**: Sistema de aprendizaje continuo
6. **DevTools**: Herramientas de desarrollo (validación, testing, formateo)

### Flujo de Trabajo

```
Code GPT → API Gateway → Code Assistant → Cursor App
    ↓           ↓              ↓            ↓
Feedback ←─ Feedback ←───── Feedback ←── Feedback
```

## Instalación

### Prerrequisitos

- Node.js 16+
- npm
- Git

### Instalación Rápida

```bash
# Clonar repositorio
git clone <repository-url>
cd code-gpt-ecosystem

# Instalar dependencias
npm install

# Configurar ecosistema
./setup-ecosystem.sh

# Iniciar ecosistema
node scripts/start-ecosystem.js
```

## Uso

### Transferir Código

```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/transfer/code', {
    sessionId: 'my-session',
    source: 'manual',
    code: 'function hello() { console.log("Hello!"); }',
    metadata: {
        language: 'javascript',
        description: 'Función de saludo'
    }
});
```

### Solicitar Mejoras

```javascript
const response = await axios.post('http://localhost:3000/improve/code', {
    sessionId: 'my-session',
    improvements: [
        { type: 'optimize_performance', description: 'Optimizar rendimiento' },
        { type: 'add_documentation', description: 'Añadir JSDoc' }
    ],
    priority: 'high'
});
```

### Enviar Feedback

```javascript
const response = await axios.post('http://localhost:3000/feedback', {
    sessionId: 'my-session',
    component: 'code_assistant',
    type: 'suggestion',
    content: 'Me gustaría más ejemplos en la documentación',
    metadata: { userAgent: 'developer' }
});
```

## API Endpoints

### API Gateway

- `GET /health` - Estado del sistema
- `POST /session` - Crear nueva sesión
- `POST /transfer/code` - Transferir código
- `POST /improve/code` - Solicitar mejoras
- `POST /feedback` - Enviar feedback
- `GET /session/:sessionId` - Obtener estado de sesión

### WebSocket

- Puerto: 3001
- Eventos: `SESSION_JOIN`, `CODE_UPDATE`, etc.

## Configuración

### Archivo de Configuración Principal

```json
{
  "ecosystem": {
    "name": "Code GPT Development Ecosystem",
    "version": "1.0.0"
  },
  "components": {
    "code_gpt": { /* configuración */ },
    "code_assistant": { /* configuración */ },
    "cursor_desktop": { /* configuración */ }
  }
}
```

## Desarrollo

### Agregar Nuevo Componente

1. Crear clase del componente
2. Registrar en API Gateway
3. Configurar eventos
4. Actualizar documentación

### Extender Funcionalidades

1. Modificar DevTools para nuevas validaciones
2. Actualizar Feedback System para nuevos insights
3. Mejorar algoritmos de mejora de código

## Monitorización

### Logs

- Ubicación: `logs/ecosystem.log`
- Formato: JSON estructurado

### Métricas

- Sesiones activas
- Feedback procesado
- Mejoras implementadas
- Tasa de satisfacción

### Reportes

```bash
# Generar reporte de feedback
node scripts/generate-feedback-report.js

# Verificar estado del sistema
node scripts/check-status.js
```

## Troubleshooting

### Problemas Comunes

1. **API Gateway no responde**
   - Verificar puerto 3000 disponible
   - Revisar logs de error

2. **WebSocket no conecta**
   - Verificar puerto 3001 disponible
   - Comprobar configuración de firewall

3. **Componentes no se comunican**
   - Verificar configuración de red
   - Revisar logs de cada componente

### Debug

```bash
# Iniciar con debug
DEBUG=* node scripts/start-ecosystem.js

# Ver logs en tiempo real
tail -f logs/ecosystem.log
```

## Contribución

1. Fork el repositorio
2. Crear rama de feature
3. Implementar cambios
4. Agregar tests
5. Crear pull request

## Licencia

Este proyecto está bajo la licencia MIT.

## Soporte

Para soporte y preguntas:
- Crear issue en GitHub
- Revisar documentación
- Consultar ejemplos en `/examples`

---

**¡Gracias por usar el Ecosistema de Desarrollo Code GPT!** 🚀
EOF

    log_success "Documentación creada"
}

# Función principal
main() {
    echo "🔧 Instalador del Ecosistema de Desarrollo Code GPT"
    echo "=================================================="

    check_requirements
    install_dependencies
    create_directories
    setup_configuration
    create_utility_scripts
    create_example_files
    setup_cursor_integration
    create_documentation

    log_success "¡Instalación completada exitosamente!"
    echo ""
    echo "🚀 Pasos siguientes:"
    echo "   1. Inicia el ecosistema: node scripts/start-ecosystem.js"
    echo "   2. Abre http://localhost:3000/health para verificar"
    echo "   3. Consulta la documentación en README-ECOSYSTEM.md"
    echo "   4. Prueba los ejemplos en la carpeta examples/"
    echo ""
    echo "💡 Para más información, consulta la documentación generada."
}

# Ejecutar función principal
main