#!/usr/bin/env node

/**
 * AUTO-PILOT: Sistema de Control Autónomo del Ecosistema Code GPT
 *
 * Este sistema mantiene el ecosistema funcionando de manera completamente automática:
 * - Monitoreo continuo de todos los componentes
 * - Recuperación automática de fallos
 * - Optimización automática de recursos
 * - Actualizaciones automáticas
 * - Gestión inteligente de sesiones
 * - Auto-aprendizaje basado en patrones
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const EventEmitter = require('events');

class AutoPilot extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            checkInterval: config.checkInterval || 30000, // 30 segundos
            maxRetries: config.maxRetries || 3,
            autoRestart: config.autoRestart !== false,
            autoUpdate: config.autoUpdate !== false,
            logLevel: config.logLevel || 'info',
            ...config
        };

        this.status = {
            isActive: false,
            startTime: null,
            components: new Map(),
            sessions: new Map(),
            errors: [],
            performance: {
                cpu: 0,
                memory: 0,
                uptime: 0
            }
        };

        this.checkTimers = new Map();
        this.recoveryProcesses = new Map();
        this.updateInProgress = false;

        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Auto-Pilot del Ecosistema Code GPT...');

        try {
            // Crear directorios necesarios
            await this.ensureDirectories();

            // Cargar configuración
            await this.loadConfiguration();

            // Iniciar monitoreo
            this.startMonitoring();

            // Iniciar componentes
            await this.startEcosystem();

            // Configurar auto-arranque
            this.setupAutoStart();

            this.status.isActive = true;
            this.status.startTime = new Date().toISOString();

            console.log('✅ Auto-Pilot activado y funcionando');
            this.emit('autopilot-ready');

            // Iniciar ciclo de control
            this.startControlLoop();

        } catch (error) {
            console.error('❌ Error iniciando Auto-Pilot:', error);
            await this.emergencyStop();
        }
    }

    async ensureDirectories() {
        const dirs = [
            'logs',
            'temp',
            'backup',
            'config',
            'data',
            'autopilot-status',
            'auto-updates'
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
            } catch (error) {
                // Ignorar si ya existe
            }
        }
    }

    async loadConfiguration() {
        try {
            const configPath = path.join(process.cwd(), 'config', 'autopilot.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            Object.assign(this.config, config);
        } catch (error) {
            console.log('⚠️  No se encontró configuración específica, usando valores por defecto');
            await this.createDefaultConfig();
        }
    }

    async createDefaultConfig() {
        const defaultConfig = {
            checkInterval: 30000,
            maxRetries: 3,
            autoRestart: true,
            autoUpdate: true,
            logLevel: 'info',
            performanceThresholds: {
                cpu: 80,
                memory: 85,
                disk: 90
            },
            backupFrequency: 3600000, // 1 hora
            updateCheckInterval: 3600000, // 1 hora
            components: {
                apiGateway: { port: 3000, priority: 'critical' },
                ecosystemIntegration: { priority: 'critical' },
                feedbackSystem: { priority: 'high' },
                devTools: { priority: 'medium' }
            }
        };

        const configPath = path.join(process.cwd(), 'config', 'autopilot.json');
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
        Object.assign(this.config, defaultConfig);
    }

    startMonitoring() {
        console.log('📊 Iniciando sistema de monitoreo...');

        // Monitorear componentes críticos
        this.monitorComponent('api-gateway', 'http://localhost:3000/health');
        this.monitorComponent('ecosystem', 'internal');

        // Monitorear recursos del sistema
        this.startResourceMonitoring();

        // Monitorear archivos de log
        this.startLogMonitoring();
    }

    async startEcosystem() {
        console.log('🔧 Iniciando componentes del ecosistema...');

        try {
            // Verificar si ya están corriendo
            const isRunning = await this.checkExistingProcesses();

            if (!isRunning) {
                // Iniciar API Gateway
                await this.startComponent('api-gateway', 'node api-gateway.js');

                // Esperar a que API Gateway esté listo
                await this.waitForService('http://localhost:3000/health', 10000);

                // Iniciar integración principal
                await this.startComponent('ecosystem', 'node ecosystem-integration.js');
            }

            console.log('✅ Ecosistema iniciado correctamente');
        } catch (error) {
            console.error('❌ Error iniciando ecosistema:', error);
            throw error;
        }
    }

    async checkExistingProcesses() {
        try {
            // Verificar si API Gateway está corriendo
            const { stdout } = await execPromise('curl -s http://localhost:3000/health || echo "not running"');
            return !stdout.includes('not running');
        } catch (error) {
            return false;
        }
    }

    async startComponent(name, command) {
        console.log(`🔧 Iniciando componente: ${name}`);

        return new Promise((resolve, reject) => {
            exec(command, { detached: true, stdio: 'ignore' }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error iniciando ${name}:`, error);
                    reject(error);
                } else {
                    console.log(`✅ Componente ${name} iniciado`);
                    this.status.components.set(name, {
                        name,
                        status: 'running',
                        startTime: new Date().toISOString(),
                        pid: process.pid
                    });
                    resolve();
                }
            });
        });
    }

    async waitForService(url, timeout = 5000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                await execPromise(`curl -s ${url} > /dev/null`);
                return true;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        throw new Error(`Service at ${url} did not respond within ${timeout}ms`);
    }

    startControlLoop() {
        console.log('🔄 Iniciando ciclo de control automático...');

        setInterval(async () => {
            await this.controlLoopIteration();
        }, this.config.checkInterval);

        // Ejecutar inmediatamente
        this.controlLoopIteration();
    }

    async controlLoopIteration() {
        try {
            // Verificar salud de componentes
            await this.healthCheck();

            // Optimizar recursos
            await this.optimizeResources();

            // Verificar actualizaciones
            if (this.config.autoUpdate) {
                await this.checkForUpdates();
            }

            // Crear backups si es necesario
            await this.createBackups();

            // Limpiar recursos antiguos
            await this.cleanup();

            // Actualizar métricas
            await this.updateMetrics();

        } catch (error) {
            console.error('❌ Error en iteración de control:', error);
            this.status.errors.push({
                timestamp: new Date().toISOString(),
                error: error.message,
                component: 'autopilot'
            });
        }
    }

    async healthCheck() {
        console.log('🏥 Ejecutando chequeo de salud...');

        for (const [name, component] of this.status.components) {
            try {
                if (component.status === 'running') {
                    await this.checkComponentHealth(name);
                }
            } catch (error) {
                console.error(`❌ Componente ${name} no responde:`, error.message);
                await this.handleComponentFailure(name);
            }
        }
    }

    async checkComponentHealth(name) {
        switch (name) {
            case 'api-gateway':
                await this.checkAPIGatewayHealth();
                break;
            case 'ecosystem':
                await this.checkEcosystemHealth();
                break;
            default:
                console.log(`⚠️  No hay chequeo específico para ${name}`);
        }
    }

    async checkAPIGatewayHealth() {
        try {
            const { stdout } = await execPromise('curl -s http://localhost:3000/health');
            const health = JSON.parse(stdout);

            if (health.status !== 'healthy') {
                throw new Error('API Gateway reports unhealthy status');
            }
        } catch (error) {
            throw new Error(`API Gateway health check failed: ${error.message}`);
        }
    }

    async checkEcosystemHealth() {
        // Verificar que el proceso principal esté corriendo
        const isRunning = await this.checkExistingProcesses();
        if (!isRunning) {
            throw new Error('Ecosystem processes not running');
        }
    }

    async handleComponentFailure(name) {
        const component = this.status.components.get(name);
        if (!component) return;

        console.log(`🔧 Iniciando recuperación de ${name}...`);

        // Marcar como fallido
        component.status = 'failed';
        component.lastFailure = new Date().toISOString();
        component.failureCount = (component.failureCount || 0) + 1;

        // Si no excede el máximo de reintentos, intentar recuperar
        if (component.failureCount <= this.config.maxRetries) {
            await this.recoverComponent(name);
        } else {
            console.error(`🚨 ${name} ha excedido el máximo de reintentos`);
            this.emit('component-failed', { name, component });
        }
    }

    async recoverComponent(name) {
        console.log(`🔄 Recuperando componente ${name}...`);

        const component = this.status.components.get(name);

        try {
            // Detener proceso si existe
            if (component.pid) {
                await this.killProcess(component.pid);
            }

            // Reiniciar componente
            await this.startComponent(name, this.getComponentCommand(name));

            // Actualizar estado
            component.status = 'running';
            component.lastRecovery = new Date().toISOString();
            component.failureCount = 0;

            console.log(`✅ ${name} recuperado exitosamente`);
            this.emit('component-recovered', { name, component });

        } catch (error) {
            console.error(`❌ Error recuperando ${name}:`, error);
            component.lastError = error.message;
        }
    }

    getComponentCommand(name) {
        const commands = {
            'api-gateway': 'node api-gateway.js',
            'ecosystem': 'node ecosystem-integration.js'
        };

        return commands[name] || `node ${name}.js`;
    }

    async killProcess(pid) {
        try {
            if (process.platform === 'win32') {
                await execPromise(`taskkill /PID ${pid} /T /F`);
            } else {
                await execPromise(`kill -TERM ${pid}`);
                // Esperar un momento y forzar si es necesario
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await execPromise(`kill -KILL ${pid}`);
                } catch (error) {
                    // Ignorar si ya está muerto
                }
            }
        } catch (error) {
            // Ignorar si el proceso ya no existe
        }
    }

    async startResourceMonitoring() {
        setInterval(async () => {
            try {
                const metrics = await this.getSystemMetrics();
                this.status.performance = metrics;

                // Verificar umbrales
                if (metrics.cpu > this.config.performanceThresholds.cpu) {
                    console.warn(`⚠️  Alto uso de CPU: ${metrics.cpu}%`);
                    await this.optimizeResources();
                }

                if (metrics.memory > this.config.performanceThresholds.memory) {
                    console.warn(`⚠️  Alto uso de memoria: ${metrics.memory}%`);
                    await this.triggerGarbageCollection();
                }

            } catch (error) {
                console.error('Error monitoreando recursos:', error);
            }
        }, 10000); // Cada 10 segundos
    }

    async getSystemMetrics() {
        try {
            // Obtener métricas del sistema
            const cpuUsage = await this.getCPUUsage();
            const memoryUsage = await this.getMemoryUsage();
            const diskUsage = await this.getDiskUsage();

            return {
                cpu: cpuUsage,
                memory: memoryUsage,
                disk: diskUsage,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error obteniendo métricas del sistema:', error);
            return { cpu: 0, memory: 0, disk: 0 };
        }
    }

    async getCPUUsage() {
        try {
            const { stdout } = await execPromise('top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\'');
            return parseFloat(stdout.trim()) || 0;
        } catch (error) {
            return 0;
        }
    }

    async getMemoryUsage() {
        try {
            const { stdout } = await execPromise('free | grep Mem | awk \'{print $3/$2 * 100.0}\'');
            return parseFloat(stdout.trim()) || 0;
        } catch (error) {
            return 0;
        }
    }

    async getDiskUsage() {
        try {
            const { stdout } = await execPromise('df . | tail -1 | awk \'{print $5}\' | sed \'s/%//\'');
            return parseInt(stdout.trim()) || 0;
        } catch (error) {
            return 0;
        }
    }

    async optimizeResources() {
        console.log('⚡ Optimizando recursos del sistema...');

        try {
            // Limpiar archivos temporales
            await this.cleanupTempFiles();

            // Optimizar procesos
            await this.optimizeProcesses();

            // Liberar memoria
            await this.triggerGarbageCollection();

            console.log('✅ Recursos optimizados');
        } catch (error) {
            console.error('❌ Error optimizando recursos:', error);
        }
    }

    async cleanupTempFiles() {
        const tempDir = path.join(process.cwd(), 'temp');
        try {
            const files = await fs.readdir(tempDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas

            for (const file of files) {
                const filePath = path.join(tempDir, file);
                const stats = await fs.stat(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            // Ignorar errores de limpieza
        }
    }

    async optimizeProcesses() {
        // Enviar señal de optimización a procesos
        this.emit('optimize-resources');
    }

    async triggerGarbageCollection() {
        // Sugerencia para el garbage collector de Node.js
        if (global.gc) {
            global.gc();
        }
    }

    async startLogMonitoring() {
        setInterval(async () => {
            await this.analyzeLogs();
        }, 60000); // Cada minuto
    }

    async analyzeLogs() {
        try {
            const logPath = path.join(process.cwd(), 'logs', 'ecosystem.log');
            const logContent = await fs.readFile(logPath, 'utf8');

            // Analizar errores
            const errorCount = (logContent.match(/ERROR/g) || []).length;
            const warningCount = (logContent.match(/WARN/g) || []).length;

            if (errorCount > 10) {
                console.warn(`⚠️  Detectados ${errorCount} errores en logs`);
                await this.handleLogErrors();
            }

        } catch (error) {
            // Ignorar si no hay logs
        }
    }

    async handleLogErrors() {
        // Implementar lógica para manejar errores recurrentes
        console.log('🔧 Analizando y manejando errores de logs...');
    }

    async checkForUpdates() {
        if (this.updateInProgress) return;

        this.updateInProgress = true;
        console.log('🔍 Verificando actualizaciones...');

        try {
            // Verificar si hay nuevas versiones
            const updateAvailable = await this.checkGitUpdates();

            if (updateAvailable) {
                console.log('⬆️  Actualización disponible, aplicando...');
                await this.applyUpdate();
            } else {
                console.log('✅ Sistema actualizado');
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones:', error);
        } finally {
            this.updateInProgress = false;
        }
    }

    async checkGitUpdates() {
        try {
            await execPromise('git fetch origin');
            const { stdout } = await execPromise('git status -uno');
            return stdout.includes('behind');
        } catch (error) {
            return false;
        }
    }

    async applyUpdate() {
        try {
            console.log('⬆️  Aplicando actualización...');

            // Crear backup
            await this.createBackup('pre-update');

            // Aplicar actualización
            await execPromise('git pull origin main');

            // Instalar nuevas dependencias
            await execPromise('npm install');

            // Reiniciar componentes
            await this.restartEcosystem();

            console.log('✅ Actualización aplicada exitosamente');

        } catch (error) {
            console.error('❌ Error aplicando actualización:', error);
            await this.rollbackUpdate();
        }
    }

    async createBackup(type = 'manual') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backup', `${type}-${timestamp}`);

        await fs.mkdir(backupDir, { recursive: true });

        // Copiar archivos importantes
        const filesToBackup = [
            'config',
            'feedback-data',
            'data'
        ];

        for (const file of filesToBackup) {
            const source = path.join(process.cwd(), file);
            const dest = path.join(backupDir, file);

            try {
                await execPromise(`cp -r ${source} ${dest}`);
            } catch (error) {
                // Ignorar si no existe
            }
        }

        console.log(`💾 Backup creado: ${backupDir}`);
    }

    async cleanup() {
        console.log('🧹 Ejecutando limpieza del sistema...');

        // Limpiar archivos temporales
        await this.cleanupTempFiles();

        // Limpiar logs antiguos
        await this.cleanupOldLogs();

        // Limpiar sesiones antiguas
        await this.cleanupOldSessions();
    }

    async cleanupOldLogs() {
        const logsDir = path.join(process.cwd(), 'logs');
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

        try {
            const files = await fs.readdir(logsDir);
            const now = Date.now();

            for (const file of files) {
                if (file.endsWith('.log')) {
                    const filePath = path.join(logsDir, file);
                    const stats = await fs.stat(filePath);

                    if (now - stats.mtime.getTime() > maxAge) {
                        await fs.unlink(filePath);
                    }
                }
            }
        } catch (error) {
            // Ignorar errores
        }
    }

    async cleanupOldSessions() {
        // Limpiar sesiones inactivas después de cierto tiempo
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
        const now = Date.now();

        for (const [sessionId, session] of this.status.sessions) {
            const lastActivity = new Date(session.lastActivity).getTime();
            if (now - lastActivity > maxSessionAge) {
                this.status.sessions.delete(sessionId);
            }
        }
    }

    async updateMetrics() {
        this.status.performance.uptime = Date.now() - new Date(this.status.startTime).getTime();
        this.status.performance.timestamp = new Date().toISOString();

        // Guardar métricas
        const metricsPath = path.join(process.cwd(), 'autopilot-status', 'metrics.json');
        await fs.writeFile(metricsPath, JSON.stringify(this.status, null, 2));
    }

    setupAutoStart() {
        if (this.config.autoRestart) {
            // Configurar para que se reinicie automáticamente en caso de fallo del sistema
            process.on('exit', () => {
                console.log('🔄 Reiniciando Auto-Pilot...');
                setTimeout(() => {
                    require('child_process').spawn(process.argv[0], process.argv.slice(1), {
                        detached: true,
                        stdio: 'inherit'
                    });
                }, 1000);
            });
        }
    }

    async emergencyStop() {
        console.log('🛑 Ejecutando parada de emergencia...');

        try {
            // Detener todos los componentes
            for (const [name, component] of this.status.components) {
                if (component.pid) {
                    await this.killProcess(component.pid);
                }
            }

            // Crear backup de emergencia
            await this.createBackup('emergency');

            // Guardar estado final
            await this.updateMetrics();

            console.log('✅ Parada de emergencia completada');
            process.exit(1);
        } catch (error) {
            console.error('❌ Error en parada de emergencia:', error);
            process.exit(1);
        }
    }

    async restartEcosystem() {
        console.log('🔄 Reiniciando ecosistema...');

        // Detener componentes
        for (const [name] of this.status.components) {
            const component = this.status.components.get(name);
            if (component.pid) {
                await this.killProcess(component.pid);
            }
        }

        // Limpiar estado
        this.status.components.clear();

        // Reiniciar
        await this.startEcosystem();

        console.log('✅ Ecosistema reiniciado');
    }

    async rollbackUpdate() {
        console.log('⏪ Revirtiendo actualización...');

        try {
            const backupDir = path.join(process.cwd(), 'backup');
            const backups = await fs.readdir(backupDir);
            const latestBackup = backups
                .filter(b => b.startsWith('pre-update'))
                .sort()
                .pop();

            if (latestBackup) {
                const backupPath = path.join(backupDir, latestBackup);

                // Restaurar archivos
                await execPromise(`cp -r ${backupPath}/* .`);

                // Reinstalar dependencias
                await execPromise('npm install');

                console.log('✅ Actualización revertida');
            }
        } catch (error) {
            console.error('❌ Error revirtiendo actualización:', error);
        }
    }

    // API Pública

    getStatus() {
        return { ...this.status };
    }

    async stop() {
        console.log('🛑 Deteniendo Auto-Pilot...');

        this.status.isActive = false;

        // Detener timers
        for (const timer of this.checkTimers.values()) {
            clearInterval(timer);
        }

        // Guardar estado final
        await this.updateMetrics();

        console.log('✅ Auto-Pilot detenido');
    }

    async createReport() {
        const report = {
            generated: new Date().toISOString(),
            status: this.status,
            config: this.config,
            metrics: await this.getSystemMetrics(),
            recentErrors: this.status.errors.slice(-10)
        };

        const reportPath = path.join(process.cwd(), 'autopilot-status', 'report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        return report;
    }
}

// Función principal
async function main() {
    const autopilot = new AutoPilot({
        checkInterval: 30000,
        maxRetries: 3,
        autoRestart: true,
        autoUpdate: true,
        logLevel: 'info'
    });

    // Manejar señales del sistema
    process.on('SIGINT', async () => {
        console.log('\n🛑 Señal de interrupción recibida...');
        await autopilot.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Señal de terminación recibida...');
        await autopilot.stop();
        process.exit(0);
    });

    // Manejar errores no capturados
    process.on('uncaughtException', async (error) => {
        console.error('💥 Error no capturado:', error);
        await autopilot.emergencyStop();
    });

    process.on('unhandledRejection', async (reason, promise) => {
        console.error('💥 Rechazo no manejado en promesa:', reason);
        await autopilot.emergencyStop();
    });

    console.log('🎯 Auto-Pilot del Ecosistema Code GPT iniciado');
    console.log('💡 El sistema funcionará de manera completamente autónoma');
    console.log('📊 Monitoreo cada 30 segundos');
    console.log('🔄 Recuperación automática habilitada');
    console.log('⬆️  Actualizaciones automáticas habilitadas');
    console.log('🛑 Presiona Ctrl+C para detener\n');

    return autopilot;
}

// Exportar para uso como módulo
module.exports = AutoPilot;

// Iniciar si se ejecuta directamente
if (require.main === module) {
    main().catch(console.error);
}