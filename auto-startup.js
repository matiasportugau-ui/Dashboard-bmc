#!/usr/bin/env node

/**
 * AUTO-STARTUP: Sistema de Arranque Automático
 *
 * Configura el ecosistema para que se inicie automáticamente en:
 * - Inicio del sistema operativo
 * - Reinicio del sistema
 * - Recuperación de fallos
 * - Inicio manual con un solo comando
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class AutoStartup {
    constructor() {
        this.platform = os.platform();
        this.userHome = os.homedir();
        this.isConfigured = false;
        this.startupMethods = {
            linux: this.setupLinuxStartup.bind(this),
            darwin: this.setupMacOSStartup.bind(this),
            win32: this.setupWindowsStartup.bind(this)
        };

        this.init();
    }

    async init() {
        console.log('🔧 Configurando Auto-Startup...');

        try {
            // Verificar si ya está configurado
            this.isConfigured = await this.checkExistingConfiguration();

            if (!this.isConfigured) {
                await this.configureAutoStartup();
            } else {
                console.log('✅ Auto-Startup ya está configurado');
            }

            // Configurar watchdog para recuperación
            this.setupWatchdog();

            // Crear script de inicio rápido
            await this.createQuickStartScript();

        } catch (error) {
            console.error('❌ Error configurando Auto-Startup:', error);
        }
    }

    async checkExistingConfiguration() {
        const checks = {
            linux: async () => {
                const systemdPath = '/etc/systemd/system/code-gpt-ecosystem.service';
                const pm2Path = path.join(this.userHome, '.pm2');
                try {
                    await fs.access(systemdPath);
                    return true;
                } catch {
                    try {
                        await fs.access(pm2Path);
                        return true;
                    } catch {
                        return false;
                    }
                }
            },
            darwin: async () => {
                const plistPath = path.join(this.userHome, 'Library', 'LaunchAgents', 'com.code-gpt-ecosystem.plist');
                try {
                    await fs.access(plistPath);
                    return true;
                } catch {
                    return false;
                }
            },
            win32: async () => {
                const taskName = 'Code GPT Ecosystem';
                try {
                    const { stdout } = await execPromise('schtasks /query /tn "' + taskName + '" 2>/dev/null | findstr "' + taskName + '"');
                    return stdout.includes(taskName);
                } catch {
                    return false;
                }
            }
        };

        return await checks[this.platform]();
    }

    async configureAutoStartup() {
        console.log(`🔧 Configurando auto-arranque para ${this.platform}...`);

        if (this.startupMethods[this.platform]) {
            await this.startupMethods[this.platform]();
        } else {
            console.log('⚠️  Plataforma no soportada para auto-arranque automático');
            console.log('💡 Usa el script de inicio rápido: ./quick-start.sh');
            return;
        }

        this.isConfigured = true;
        console.log('✅ Auto-Startup configurado exitosamente');
    }

    async setupLinuxStartup() {
        console.log('🐧 Configurando systemd service...');

        // Crear directorio de systemd
        await execPromise('sudo mkdir -p /etc/systemd/system');

        // Crear archivo de servicio
        const serviceContent = `# Code GPT Ecosystem Auto-Startup Service
[Unit]
Description=Code GPT Ecosystem - Auto-Pilot
After=network.target
Wants=network.target

[Service]
Type=forking
User=${os.userInfo().username}
WorkingDirectory=${process.cwd()}
ExecStart=${process.execPath} ${path.join(process.cwd(), 'autopilot.js')}
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=code-gpt-ecosystem

[Install]
WantedBy=multi-user.target
`;

        const servicePath = '/etc/systemd/system/code-gpt-ecosystem.service';
        await fs.writeFile('/tmp/code-gpt-ecosystem.service', serviceContent);
        await execPromise('sudo mv /tmp/code-gpt-ecosystem.service ' + servicePath);
        await execPromise('sudo chmod 644 ' + servicePath);

        // Recargar systemd y habilitar servicio
        await execPromise('sudo systemctl daemon-reload');
        await execPromise('sudo systemctl enable code-gpt-ecosystem.service');

        console.log('✅ Servicio systemd configurado');
        console.log('💡 Para iniciar manualmente: sudo systemctl start code-gpt-ecosystem');
        console.log('💡 Para ver logs: sudo journalctl -u code-gpt-ecosystem -f');
    }

    async setupMacOSStartup() {
        console.log('🍎 Configurando Launch Agent...');

        // Crear directorio de LaunchAgents
        const launchDir = path.join(this.userHome, 'Library', 'LaunchAgents');
        await fs.mkdir(launchDir, { recursive: true });

        // Crear archivo plist
        const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.code-gpt-ecosystem</string>
    <key>ProgramArguments</key>
    <array>
        <string>${process.execPath}</string>
        <string>${path.join(process.cwd(), 'autopilot.js')}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${process.cwd()}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${path.join(process.cwd(), 'logs', 'startup.log')}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(process.cwd(), 'logs', 'startup-error.log')}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${path.dirname(process.execPath)}</string>
    </dict>
</dict>
</plist>`;

        const plistPath = path.join(launchDir, 'com.code-gpt-ecosystem.plist');
        await fs.writeFile(plistPath, plistContent);

        // Cargar el launch agent
        await execPromise('launchctl load ' + plistPath);

        console.log('✅ Launch Agent configurado');
        console.log('💡 Para ver logs: tail -f logs/startup.log');
    }

    async setupWindowsStartup() {
        console.log('🪟 Configurando Scheduled Task...');

        // Crear script de inicio para Windows
        const scriptContent = `@echo off
cd /d "${process.cwd()}"
node autopilot.js
`;

        const scriptPath = path.join(process.cwd(), 'start-ecosystem.bat');
        await fs.writeFile(scriptPath, scriptContent);

        // Crear tarea programada
        const taskName = 'Code GPT Ecosystem';
        const command = `schtasks /create /tn "${taskName}" /tr "'${scriptPath}'" /sc onlogon /rl highest /f`;

        await execPromise(command);

        console.log('✅ Scheduled Task configurado');
        console.log('💡 Para ver tareas: schtasks /query /tn "' + taskName + '"');
    }

    setupWatchdog() {
        console.log('👀 Configurando watchdog...');

        // Monitorear si el proceso principal está corriendo
        setInterval(async () => {
            const isRunning = await this.isEcosystemRunning();

            if (!isRunning && this.isConfigured) {
                console.log('🚨 Ecosistema no está corriendo, iniciando...');
                await this.startEcosystem();
            }
        }, 30000); // Cada 30 segundos
    }

    async isEcosystemRunning() {
        try {
            const { stdout } = await execPromise('curl -s http://localhost:3000/health || echo "not running"');
            return !stdout.includes('not running');
        } catch (error) {
            return false;
        }
    }

    async startEcosystem() {
        console.log('🚀 Iniciando ecosistema...');

        try {
            const child = require('child_process').spawn(process.execPath, ['autopilot.js'], {
                detached: true,
                stdio: 'ignore',
                cwd: process.cwd()
            });

            child.unref();
            console.log('✅ Ecosistema iniciado');
        } catch (error) {
            console.error('❌ Error iniciando ecosistema:', error);
        }
    }

    async createQuickStartScript() {
        console.log('⚡ Creando script de inicio rápido...');

        const scriptContent = `#!/bin/bash

# Code GPT Ecosystem - Quick Start Script
# Este script inicia el ecosistema de manera rápida y sencilla

echo "🚀 Iniciando Code GPT Ecosystem..."

# Función para limpiar procesos anteriores
cleanup() {
    echo "🧹 Limpiando procesos anteriores..."
    pkill -f "node.*autopilot.js" 2>/dev/null || true
    pkill -f "node.*ecosystem-integration.js" 2>/dev/null || true
    pkill -f "node.*api-gateway.js" 2>/dev/null || true
    sleep 2
}

# Función para verificar dependencias
check_dependencies() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js no está instalado"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo "❌ npm no está instalado"
        exit 1
    fi

    echo "✅ Dependencias verificadas"
}

# Función para instalar dependencias si es necesario
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias..."
        npm install
    fi
}

# Función principal
main() {
    echo "🔧 Code GPT Ecosystem - Inicio Rápido"
    echo "====================================="

    cleanup
    check_dependencies
    install_deps

    echo "🎯 Iniciando Auto-Pilot..."
    nohup node autopilot.js > logs/autopilot.log 2>&1 &
    AUTOPILOT_PID=$!

    echo "📊 Iniciando Dashboard..."
    nohup node auto-dashboard.js > logs/dashboard.log 2>&1 &
    DASHBOARD_PID=$!

    echo "🌐 Iniciando API Gateway..."
    nohup node api-gateway.js > logs/api-gateway.log 2>&1 &
    API_PID=$!

    echo ""
    echo "✅ Ecosistema iniciado correctamente!"
    echo ""
    echo "🌐 Dashboard: http://localhost:8080"
    echo "🔌 API: http://localhost:3000"
    echo "📡 WebSocket: ws://localhost:8081"
    echo ""
    echo "📋 PIDs:"
    echo "   Auto-Pilot: $AUTOPILOT_PID"
    echo "   Dashboard: $DASHBOARD_PID"
    echo "   API Gateway: $API_PID"
    echo ""
    echo "💡 Comandos útiles:"
    echo "   ./stop-ecosystem.sh    - Detener ecosistema"
    echo "   ./restart-ecosystem.sh - Reiniciar ecosistema"
    echo "   tail -f logs/*.log     - Ver logs en tiempo real"
    echo ""
    echo "🛑 Presiona Ctrl+C para detener"
    echo ""

    # Mantener script vivo
    trap 'echo "🛑 Deteniendo ecosistema..."; kill $AUTOPILOT_PID $DASHBOARD_PID $API_PID 2>/dev/null; exit 0' INT TERM
    wait
}

main "$@"
`;

        await fs.writeFile('quick-start.sh', scriptContent);
        await execPromise('chmod +x quick-start.sh');

        console.log('✅ Script de inicio rápido creado: ./quick-start.sh');
    }

    async createStopScript() {
        const scriptContent = `#!/bin/bash

# Code GPT Ecosystem - Stop Script
echo "🛑 Deteniendo Code GPT Ecosystem..."

# Detener procesos
echo "🔧 Deteniendo Auto-Pilot..."
pkill -f "node.*autopilot.js" 2>/dev/null || true

echo "🖥️  Deteniendo Dashboard..."
pkill -f "node.*auto-dashboard.js" 2>/dev/null || true

echo "🌐 Deteniendo API Gateway..."
pkill -f "node.*api-gateway.js" 2>/dev/null || true

echo "🔌 Deteniendo WebSocket..."
pkill -f "node.*cursor-integration.js" 2>/dev/null || true

# Limpiar puertos
echo "🧹 Limpiando puertos..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo "✅ Ecosistema detenido"
`;

        await fs.writeFile('stop-ecosystem.sh', scriptContent);
        await execPromise('chmod +x stop-ecosystem.sh');
    }

    async createRestartScript() {
        const scriptContent = `#!/bin/bash

# Code GPT Ecosystem - Restart Script
echo "🔄 Reiniciando Code GPT Ecosystem..."

./stop-ecosystem.sh
sleep 3
./quick-start.sh
`;

        await fs.writeFile('restart-ecosystem.sh', scriptContent);
        await execPromise('chmod +x restart-ecosystem.sh');
    }

    async createStatusScript() {
        const scriptContent = `#!/bin/bash

# Code GPT Ecosystem - Status Script
echo "📊 Estado del Code GPT Ecosystem"
echo "================================"

# Verificar procesos
echo "🔍 Procesos corriendo:"
echo "  Auto-Pilot: $(pgrep -f "node.*autopilot.js" | wc -l) instancias"
echo "  Dashboard: $(pgrep -f "node.*auto-dashboard.js" | wc -l) instancias"
echo "  API Gateway: $(pgrep -f "node.*api-gateway.js" | wc -l) instancias"

# Verificar puertos
echo ""
echo "🔌 Puertos:"
echo "  3000 (API): $(lsof -i:3000 | wc -l) conexiones"
echo "  8080 (Dashboard): $(lsof -i:8080 | wc -l) conexiones"
echo "  8081 (WebSocket): $(lsof -i:8081 | wc -l) conexiones"

# Verificar servicios
echo ""
echo "🌐 Servicios:"
curl -s http://localhost:3000/health > /dev/null && echo "  ✅ API Gateway: Saludable" || echo "  ❌ API Gateway: No responde"
curl -s http://localhost:8080 > /dev/null && echo "  ✅ Dashboard: Saludable" || echo "  ❌ Dashboard: No responde"

# Mostrar logs recientes
echo ""
echo "📋 Logs recientes:"
echo "  Auto-Pilot: $(tail -1 logs/autopilot.log 2>/dev/null || echo "No hay logs")"
echo "  Dashboard: $(tail -1 logs/dashboard.log 2>/dev/null || echo "No hay logs")"
echo "  API Gateway: $(tail -1 logs/api-gateway.log 2>/dev/null || echo "No hay logs")"

echo ""
echo "✅ Verificación completada"
`;

        await fs.writeFile('status-ecosystem.sh', scriptContent);
        await execPromise('chmod +x status-ecosystem.sh');
    }

    async createDockerSetup() {
        console.log('🐳 Creando configuración Docker...');

        // Crear Dockerfile
        const dockerfileContent = `FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl bash

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./
COPY . .

# Instalar dependencias
RUN npm ci --only=production

# Crear directorios necesarios
RUN mkdir -p logs temp feedback-data backup autopilot-status auto-updates

# Exponer puertos
EXPOSE 3000 8080 8081 3001 3002

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando por defecto
CMD ["node", "autopilot.js"]
`;

        await fs.writeFile('Dockerfile', dockerfileContent);

        // Crear docker-compose.yml
        const composeContent = `version: '3.8'

services:
  code-gpt-ecosystem:
    build: .
    container_name: code-gpt-ecosystem
    restart: unless-stopped
    ports:
      - "3000:3000"   # API Gateway
      - "8080:8080"   # Dashboard
      - "8081:8081"   # WebSocket
      - "3001:3001"   # Cursor Integration
      - "3002:3002"   # Additional services
    volumes:
      - ./logs:/app/logs
      - ./feedback-data:/app/feedback-data
      - ./backup:/app/backup
      - ./autopilot-status:/app/autopilot-status
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - code-gpt-network

networks:
  code-gpt-network:
    driver: bridge
`;

        await fs.writeFile('docker-compose.yml', composeContent);

        // Crear script de Docker
        const dockerScript = `#!/bin/bash

# Code GPT Ecosystem - Docker Script
echo "🐳 Code GPT Ecosystem - Docker Management"
echo "========================================"

case "\$1" in
    "build")
        echo "🔨 Construyendo imagen Docker..."
        docker build -t code-gpt-ecosystem .
        ;;
    "start")
        echo "🚀 Iniciando con Docker Compose..."
        docker-compose up -d
        ;;
    "stop")
        echo "🛑 Deteniendo Docker Compose..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Reiniciando con Docker Compose..."
        docker-compose restart
        ;;
    "logs")
        echo "📋 Mostrando logs..."
        docker-compose logs -f
        ;;
    "status")
        echo "📊 Estado de contenedores:"
        docker-compose ps
        ;;
    *)
        echo "Uso: \$0 {build|start|stop|restart|logs|status}"
        exit 1
        ;;
esac
`;

        await fs.writeFile('docker-manage.sh', dockerScript);
        await execPromise('chmod +x docker-manage.sh');

        console.log('✅ Configuración Docker creada');
        console.log('💡 Usa: ./docker-manage.sh start');
    }

    async createSystemdService() {
        // Crear servicio systemd para el watchdog
        const serviceContent = `[Unit]
Description=Code GPT Ecosystem Watchdog
After=network.target
Wants=network.target

[Service]
Type=simple
User=${os.userInfo().username}
WorkingDirectory=${process.cwd()}
ExecStart=${process.execPath} ${path.join(process.cwd(), 'auto-startup.js')}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=code-gpt-watchdog

[Install]
WantedBy=multi-user.target
`;

        await fs.writeFile('/tmp/code-gpt-watchdog.service', serviceContent);
        await execPromise('sudo mv /tmp/code-gpt-watchdog.service /etc/systemd/system/');
        await execPromise('sudo systemctl daemon-reload');
        await execPromise('sudo systemctl enable code-gpt-watchdog.service');

        console.log('✅ Servicio watchdog configurado');
    }

    async createInstallationScript() {
        console.log('📦 Creando script de instalación completo...');

        const installScript = `#!/bin/bash

# Code GPT Ecosystem - Complete Installation Script
# Este script configura todo el ecosistema automáticamente

set -e

echo "🚀 Instalación Completa del Code GPT Ecosystem"
echo "=============================================="

# Función de logging
log() {
    echo "[\$(date +'%Y-%m-%d %H:%M:%S')] \$1"
}

log "Iniciando instalación..."

# Verificar requisitos
log "Verificando requisitos del sistema..."
if ! command -v node &> /dev/null; then
    log "❌ Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    log "❌ npm no está instalado"
    exit 1
fi

if ! command -v git &> /dev/null; then
    log "❌ git no está instalado. Instalando..."
    sudo apt-get update && sudo apt-get install -y git
fi

# Instalar dependencias
log "Instalando dependencias..."
npm install

# Configurar auto-arranque
log "Configurando auto-arranque..."
node auto-startup.js

# Crear scripts de utilidad
log "Creando scripts de utilidad..."
chmod +x *.sh

# Configurar permisos
log "Configurando permisos..."
chmod +x autopilot.js
chmod +x auto-dashboard.js
chmod +x ecosystem-integration.js
chmod +x api-gateway.js

# Crear estructura de directorios
log "Creando estructura de directorios..."
mkdir -p logs temp feedback-data backup autopilot-status auto-updates

# Configurar logging
log "Configurando logging..."
touch logs/ecosystem.log logs/autopilot.log logs/dashboard.log

# Mostrar información final
log "✅ Instalación completada!"
echo ""
echo "🎉 Code GPT Ecosystem instalado exitosamente!"
echo ""
echo "📋 Comandos disponibles:"
echo "   ./quick-start.sh       - Iniciar ecosistema"
echo "   ./status-ecosystem.sh  - Verificar estado"
echo "   ./stop-ecosystem.sh    - Detener ecosistema"
echo "   ./restart-ecosystem.sh - Reiniciar ecosistema"
echo "   ./docker-manage.sh     - Gestionar con Docker"
echo ""
echo "🌐 URLs disponibles:"
echo "   Dashboard: http://localhost:8080"
echo "   API: http://localhost:3000"
echo "   WebSocket: ws://localhost:8081"
echo ""
echo "📚 Documentación:"
echo "   README.md              - Documentación principal"
echo "   README-ECOSYSTEM.md    - Guía del ecosistema"
echo ""
echo "💡 Para iniciar ahora: ./quick-start.sh"
echo ""

log "Instalación finalizada"
`;

        await fs.writeFile('install-ecosystem.sh', installScript);
        await execPromise('chmod +x install-ecosystem.sh');

        console.log('✅ Script de instalación completo creado');
    }

    async showConfigurationSummary() {
        const summary = {
            platform: this.platform,
            autoStartupConfigured: this.isConfigured,
            scriptsCreated: [
                'quick-start.sh',
                'stop-ecosystem.sh',
                'restart-ecosystem.sh',
                'status-ecosystem.sh',
                'docker-manage.sh',
                'install-ecosystem.sh'
            ],
            dockerConfigured: true,
            watchdogActive: true,
            startupMethod: this.platform === 'linux' ? 'systemd' :
                          this.platform === 'darwin' ? 'launchd' : 'scheduled task'
        };

        console.log('📋 Resumen de configuración:');
        console.log('   Plataforma:', summary.platform);
        console.log('   Auto-arranque:', summary.autoStartupConfigured ? '✅' : '❌');
        console.log('   Método de inicio:', summary.startupMethod);
        console.log('   Watchdog activo:', '✅');
        console.log('   Docker configurado:', '✅');
        console.log('   Scripts creados:', summary.scriptsCreated.length);
    }
}

// Función principal
async function main() {
    console.log('🚀 Configurando Auto-Startup para Code GPT Ecosystem...\n');

    const startup = new AutoStartup();

    // Crear scripts adicionales
    await startup.createStopScript();
    await startup.createRestartScript();
    await startup.createStatusScript();
    await startup.createDockerSetup();
    await startup.createInstallationScript();
    await startup.createSystemdService();

    // Mostrar resumen
    await startup.showConfigurationSummary();

    console.log('\n✅ Auto-Startup configurado exitosamente!');
    console.log('\n💡 Comandos disponibles:');
    console.log('   ./quick-start.sh       - Iniciar rápidamente');
    console.log('   ./status-ecosystem.sh  - Verificar estado');
    console.log('   ./install-ecosystem.sh - Instalación completa');
    console.log('   ./docker-manage.sh     - Gestionar con Docker');

    if (startup.platform === 'linux') {
        console.log('   sudo systemctl start code-gpt-ecosystem    - Iniciar servicio');
        console.log('   sudo systemctl status code-gpt-ecosystem   - Estado del servicio');
        console.log('   sudo journalctl -u code-gpt-ecosystem -f   - Ver logs');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoStartup;