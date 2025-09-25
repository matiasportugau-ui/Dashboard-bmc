#!/usr/bin/env node

/**
 * MASTER AUTO-PILOT: Sistema de Control Maestro
 *
 * Integra todos los componentes del auto-pilot:
 * - Auto-Pilot principal (monitoreo y recuperación)
 * - Dashboard web (interfaz de control)
 * - Auto-Startup (arranque automático)
 * - Auto-Updater (actualizaciones automáticas)
 * - Sistema de logs y métricas
 */

const AutoPilot = require('./autopilot');
const AutoDashboard = require('./auto-dashboard');
const AutoStartup = require('./auto-startup');
const AutoUpdater = require('./auto-updater');
const fs = require('fs').promises;
const path = require('path');

class MasterAutoPilot {
    constructor(config = {}) {
        this.config = {
            port: config.port || 8080,
            enableDashboard: config.enableDashboard !== false,
            enableAutoStartup: config.enableAutoStartup !== false,
            enableAutoUpdater: config.enableAutoUpdater !== false,
            enableLogging: config.enableLogging !== false,
            ...config
        };

        this.components = {
            autopilot: null,
            dashboard: null,
            startup: null,
            updater: null
        };

        this.isRunning = false;
        this.startTime = null;

        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Master Auto-Pilot del Ecosistema Code GPT...');
        console.log('🎯 Sistema de Control Autónomo Completo');
        console.log('==================================================\n');

        try {
            // Crear estructura de directorios
            await this.createDirectories();

            // Configurar logging
            if (this.config.enableLogging) {
                this.setupLogging();
            }

            // Iniciar componentes
            await this.startComponents();

            // Configurar interconexiones
            this.setupInterconnections();

            // Iniciar sistema principal
            await this.startMainSystem();

            this.isRunning = true;
            this.startTime = new Date().toISOString();

            console.log('✅ Master Auto-Pilot iniciado exitosamente!\n');

            this.showStatus();
            this.showControls();

            // Mantener el proceso vivo
            this.keepAlive();

        } catch (error) {
            console.error('❌ Error iniciando Master Auto-Pilot:', error);
            await this.emergencyShutdown();
        }
    }

    async createDirectories() {
        const dirs = [
            'logs',
            'temp',
            'backup',
            'config',
            'data',
            'autopilot-status',
            'auto-updates',
            'dashboard-ui',
            'scripts'
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(path.join(__dirname, dir), { recursive: true });
            } catch (error) {
                // Ya existe, continuar
            }
        }
    }

    setupLogging() {
        console.log('📝 Configurando sistema de logging...');

        // Configurar logging para todos los componentes
        process.env.LOG_LEVEL = 'info';
        process.env.LOG_TO_FILE = 'true';
        process.env.LOG_DIRECTORY = path.join(__dirname, 'logs');
    }

    async startComponents() {
        console.log('🔧 Iniciando componentes del sistema...\n');

        // 1. Iniciar Auto-Updater
        if (this.config.enableAutoUpdater) {
            console.log('⬆️  Iniciando Auto-Updater...');
            this.components.updater = new AutoUpdater({
                checkInterval: 3600000,
                autoInstall: true,
                backupBeforeUpdate: true
            });
            console.log('✅ Auto-Updater iniciado\n');
        }

        // 2. Iniciar Auto-Startup
        if (this.config.enableAutoStartup) {
            console.log('🚀 Iniciando Auto-Startup...');
            this.components.startup = new AutoStartup();
            console.log('✅ Auto-Startup iniciado\n');
        }

        // 3. Iniciar Dashboard
        if (this.config.enableDashboard) {
            console.log('🌐 Iniciando Dashboard Web...');
            this.components.dashboard = new AutoDashboard(this.config.port);
            console.log('✅ Dashboard iniciado en http://localhost:' + this.config.port + '\n');
        }

        // 4. Iniciar Auto-Pilot principal
        console.log('🎯 Iniciando Auto-Pilot principal...');
        this.components.autopilot = new AutoPilot({
            checkInterval: 30000,
            maxRetries: 3,
            autoRestart: true,
            autoUpdate: true
        });
        console.log('✅ Auto-Pilot principal iniciado\n');
    }

    setupInterconnections() {
        console.log('🔗 Configurando interconexiones entre componentes...\n');

        // Conectar eventos entre componentes
        if (this.components.updater && this.components.autopilot) {
            this.components.updater.on('update-installed', (data) => {
                console.log('🔄 Actualización instalada, reiniciando ecosistema...');
                this.components.autopilot.restartEcosystem();
            });

            this.components.updater.on('update-failed', (data) => {
                console.log('❌ Actualización fallida:', data.error);
                this.components.autopilot.emit('update-error', data);
            });
        }

        if (this.components.autopilot && this.components.dashboard) {
            this.components.autopilot.on('component-failed', (data) => {
                console.log('📡 Notificando dashboard de fallo en componente:', data.name);
                // El dashboard ya está suscrito a los eventos del autopilot
            });
        }

        console.log('✅ Interconexiones configuradas\n');
    }

    async startMainSystem() {
        console.log('🏁 Iniciando sistema principal del ecosistema...\n');

        // Esperar a que el Auto-Pilot esté listo
        await new Promise((resolve) => {
            if (this.components.autopilot) {
                this.components.autopilot.on('autopilot-ready', resolve);
            } else {
                resolve();
            }
        });

        console.log('✅ Sistema principal iniciado\n');
    }

    showStatus() {
        console.log('📊 Estado del Master Auto-Pilot:');
        console.log('   ════════════════════════════════════════');
        console.log(\`   Auto-Pilot Principal: \${this.components.autopilot ? '✅ Activo' : '❌ Inactivo'}\`);
        console.log(\`   Dashboard Web: \${this.components.dashboard ? '✅ Activo' : '❌ Inactivo'}\`);
        console.log(\`   Auto-Startup: \${this.components.startup ? '✅ Activo' : '❌ Inactivo'}\`);
        console.log(\`   Auto-Updater: \${this.components.updater ? '✅ Activo' : '❌ Inactivo'}\`);
        console.log(\`   Tiempo activo: \${this.formatUptime(Date.now() - new Date(this.startTime).getTime())}\`);
        console.log('   ════════════════════════════════════════\n');
    }

    showControls() {
        console.log('🎮 Comandos disponibles:');
        console.log('   ════════════════════════════════════════');
        console.log('   Dashboard: http://localhost:' + this.config.port);
        console.log('   Logs: tail -f logs/*.log');
        console.log('   Estado: ./status-ecosystem.sh');
        console.log('   Reiniciar: ./restart-ecosystem.sh');
        console.log('   Detener: ./stop-ecosystem.sh');
        console.log('   ════════════════════════════════════════\n');
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return \`\${hours}h \${minutes % 60}m \${seconds % 60}s\`;
        if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
        return \`\${seconds}s\`;
    }

    keepAlive() {
        // Mantener el proceso principal vivo
        const keepAlive = () => {
            if (this.isRunning) {
                setTimeout(keepAlive, 1000);
            }
        };
        keepAlive();

        // Manejar señales del sistema
        process.on('SIGINT', async () => {
            console.log('\n🛑 Señal de interrupción recibida...');
            await this.gracefulShutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Señal de terminación recibida...');
            await this.gracefulShutdown();
            process.exit(0);
        });

        // Manejar errores no capturados
        process.on('uncaughtException', async (error) => {
            console.error('💥 Error no capturado:', error);
            await this.emergencyShutdown();
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('💥 Rechazo no manejado:', reason);
            await this.emergencyShutdown();
        });
    }

    async gracefulShutdown() {
        console.log('\n🛑 Iniciando apagado graceful del Master Auto-Pilot...');

        this.isRunning = false;

        // Detener componentes en orden inverso
        if (this.components.autopilot) {
            console.log('🛑 Deteniendo Auto-Pilot...');
            await this.components.autopilot.stop();
        }

        if (this.components.dashboard) {
            console.log('🛑 Deteniendo Dashboard...');
            // El dashboard se detiene automáticamente con el proceso
        }

        if (this.components.updater) {
            console.log('🛑 Deteniendo Auto-Updater...');
            // El updater no tiene método de stop específico
        }

        // Crear reporte final
        await this.createFinalReport();

        console.log('✅ Apagado graceful completado');
    }

    async emergencyShutdown() {
        console.log('\n🚨 Iniciando apagado de emergencia...');

        this.isRunning = false;

        // Detener todos los componentes inmediatamente
        for (const [name, component] of Object.entries(this.components)) {
            if (component && typeof component.stop === 'function') {
                try {
                    await component.stop();
                } catch (error) {
                    console.error(\`Error deteniendo \${name}:\`, error);
                }
            }
        }

        // Crear backup de emergencia
        await this.createEmergencyBackup();

        console.log('✅ Apagado de emergencia completado');
        process.exit(1);
    }

    async createFinalReport() {
        const report = {
            shutdownTime: new Date().toISOString(),
            totalUptime: Date.now() - new Date(this.startTime).getTime(),
            componentsStatus: Object.entries(this.components).map(([name, component]) => ({
                name,
                active: component !== null
            })),
            configuration: this.config
        };

        const reportPath = path.join(__dirname, 'logs', 'shutdown-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    }

    async createEmergencyBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, 'backup', \`emergency-\${timestamp}\`);

        try {
            await fs.mkdir(backupDir, { recursive: true });
            await fs.cp('config', backupDir, { recursive: true });
            await fs.cp('feedback-data', backupDir, { recursive: true });
            await fs.cp('autopilot-status', backupDir, { recursive: true });
        } catch (error) {
            console.error('Error creando backup de emergencia:', error);
        }
    }
}

// Función principal
async function main() {
    const config = {
        port: 8080,
        enableDashboard: true,
        enableAutoStartup: true,
        enableAutoUpdater: true,
        enableLogging: true
    };

    const masterAutopilot = new MasterAutoPilot(config);

    // Manejar argumentos de línea de comandos
    const args = process.argv.slice(2);

    if (args.includes('--no-dashboard')) {
        config.enableDashboard = false;
    }

    if (args.includes('--no-startup')) {
        config.enableAutoStartup = false;
    }

    if (args.includes('--no-updater')) {
        config.enableAutoUpdater = false;
    }

    if (args.includes('--port')) {
        const portIndex = args.indexOf('--port');
        if (portIndex < args.length - 1) {
            config.port = parseInt(args[portIndex + 1]);
        }
    }

    console.log('🎯 Master Auto-Pilot iniciado con configuración:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MasterAutoPilot;