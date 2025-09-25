#!/usr/bin/env node

/**
 * DASHBOARD WEB: Interfaz de Control para Auto-Pilot
 *
 * Dashboard web en tiempo real para monitorear y controlar el sistema Auto-Pilot
 * - Visualización en tiempo real del estado del sistema
 * - Control manual de componentes
 * - Métricas de rendimiento
 * - Logs en vivo
 * - Alertas automáticas
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const AutoPilot = require('./autopilot');

class AutoDashboard {
    constructor(port = 8080) {
        this.port = port;
        this.app = express();
        this.autopilot = null;
        this.clients = new Set(); // WebSocket clients
        this.logStream = null;

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.startServer();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'dashboard-ui')));
        this.app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
    }

    setupRoutes() {
        // API Routes
        this.app.get('/api/status', async (req, res) => {
            try {
                if (!this.autopilot) {
                    return res.json({ error: 'Auto-Pilot not initialized' });
                }

                const status = this.autopilot.getStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/metrics', async (req, res) => {
            try {
                const metrics = await this.getDetailedMetrics();
                res.json(metrics);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/logs', async (req, res) => {
            try {
                const logs = await this.getRecentLogs();
                res.json(logs);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/alerts', async (req, res) => {
            try {
                const alerts = await this.getActiveAlerts();
                res.json(alerts);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/control/:action', async (req, res) => {
            try {
                const action = req.params.action;
                const result = await this.executeControlAction(action, req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/report', async (req, res) => {
            try {
                if (!this.autopilot) {
                    return res.json({ error: 'Auto-Pilot not initialized' });
                }

                const report = await this.autopilot.createReport();
                res.json(report);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Serve dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard-ui', 'index.html'));
        });
    }

    setupWebSocket() {
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({ port: 8081 });

        wss.on('connection', (ws) => {
            console.log('📡 Cliente conectado al dashboard');
            this.clients.add(ws);

            ws.on('message', (message) => {
                this.handleWebSocketMessage(ws, message);
            });

            ws.on('close', () => {
                console.log('📡 Cliente desconectado del dashboard');
                this.clients.delete(ws);
            });

            // Enviar estado inicial
            this.sendToClient(ws, 'initial-status', this.autopilot?.getStatus() || { isActive: false });
        });

        // Enviar actualizaciones en tiempo real
        setInterval(() => {
            this.broadcastStatus();
        }, 2000);
    }

    handleWebSocketMessage(ws, message) {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'control-action':
                    this.executeControlAction(data.action, data.params)
                        .then(result => {
                            this.sendToClient(ws, 'action-result', result);
                        })
                        .catch(error => {
                            this.sendToClient(ws, 'action-error', { error: error.message });
                        });
                    break;

                case 'get-logs':
                    this.getRecentLogs().then(logs => {
                        this.sendToClient(ws, 'logs-data', logs);
                    });
                    break;

                case 'get-metrics':
                    this.getDetailedMetrics().then(metrics => {
                        this.sendToClient(ws, 'metrics-data', metrics);
                    });
                    break;
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    sendToClient(ws, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
        }
    }

    broadcastToAll(type, data) {
        this.clients.forEach(client => {
            this.sendToClient(client, type, data);
        });
    }

    broadcastStatus() {
        if (this.autopilot) {
            const status = this.autopilot.getStatus();
            this.broadcastToAll('status-update', status);
        }
    }

    startServer() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Dashboard Auto-Pilot corriendo en http://localhost:${this.port}`);
            console.log(`📡 WebSocket en puerto 8081`);
        });
    }

    async initializeAutoPilot() {
        this.autopilot = new AutoPilot();

        // Configurar listeners para actualizaciones en tiempo real
        this.autopilot.on('component-failed', (data) => {
            this.broadcastToAll('alert', {
                type: 'error',
                message: `Componente ${data.name} falló`,
                component: data.name,
                severity: 'high'
            });
        });

        this.autopilot.on('component-recovered', (data) => {
            this.broadcastToAll('alert', {
                type: 'success',
                message: `Componente ${data.name} recuperado`,
                component: data.name,
                severity: 'info'
            });
        });

        this.autopilot.on('autopilot-ready', () => {
            this.broadcastToAll('alert', {
                type: 'success',
                message: 'Auto-Pilot iniciado y funcionando',
                severity: 'info'
            });
        });

        return this.autopilot;
    }

    async getDetailedMetrics() {
        if (!this.autopilot) {
            return { error: 'Auto-Pilot not initialized' };
        }

        const status = this.autopilot.getStatus();
        const systemMetrics = await this.getSystemMetrics();

        return {
            ecosystem: status,
            system: systemMetrics,
            components: Array.from(status.components.entries()).map(([name, component]) => ({
                name,
                status: component.status,
                uptime: component.startTime ? Date.now() - new Date(component.startTime).getTime() : 0,
                failureCount: component.failureCount || 0
            })),
            sessions: Array.from(status.sessions.entries()).map(([id, session]) => ({
                id,
                lastActivity: session.lastActivity,
                active: Date.now() - new Date(session.lastActivity).getTime() < 300000 // 5 minutos
            }))
        };
    }

    async getSystemMetrics() {
        const execPromise = require('util').promisify(require('child_process').exec);

        try {
            // CPU
            const { stdout: cpuStdout } = await execPromise('top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\'');
            const cpuUsage = parseFloat(cpuStdout.trim()) || 0;

            // Memory
            const { stdout: memStdout } = await execPromise('free | grep Mem | awk \'{print $3/$2 * 100.0}\'');
            const memoryUsage = parseFloat(memStdout.trim()) || 0;

            // Disk
            const { stdout: diskStdout } = await execPromise('df . | tail -1 | awk \'{print $5}\' | sed \'s/%//\'');
            const diskUsage = parseInt(diskStdout.trim()) || 0;

            // Network
            const { stdout: netStdout } = await execPromise('cat /proc/net/dev | grep eth0 | awk \'{print $2, $10}\'');
            const network = netStdout.trim().split(/\s+/) || [0, 0];

            return {
                cpu: cpuUsage,
                memory: memoryUsage,
                disk: diskUsage,
                network: {
                    rx: parseInt(network[0]) || 0,
                    tx: parseInt(network[1]) || 0
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: { rx: 0, tx: 0 },
                error: error.message
            };
        }
    }

    async getRecentLogs() {
        try {
            const logPath = path.join(__dirname, 'logs', 'ecosystem.log');
            const logContent = await fs.readFile(logPath, 'utf8');

            const lines = logContent.split('\n').slice(-100); // Últimas 100 líneas

            return lines.map((line, index) => ({
                id: lines.length - index,
                content: line,
                timestamp: new Date().toISOString(), // Simplificado
                level: this.extractLogLevel(line)
            })).filter(log => log.content.trim());
        } catch (error) {
            return [];
        }
    }

    extractLogLevel(line) {
        if (line.includes('ERROR')) return 'error';
        if (line.includes('WARN')) return 'warning';
        if (line.includes('INFO')) return 'info';
        return 'debug';
    }

    async getActiveAlerts() {
        if (!this.autopilot) return [];

        const status = this.autopilot.getStatus();
        const alerts = [];

        // Componentes fallidos
        for (const [name, component] of status.components) {
            if (component.status === 'failed') {
                alerts.push({
                    id: `component-${name}`,
                    type: 'error',
                    message: `Componente ${name} no responde`,
                    component: name,
                    severity: 'critical',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Errores recientes
        status.errors.slice(-5).forEach((error, index) => {
            alerts.push({
                id: `error-${index}`,
                type: 'error',
                message: error.error,
                component: error.component,
                severity: 'high',
                timestamp: error.timestamp
            });
        });

        return alerts;
    }

    async executeControlAction(action, params = {}) {
        console.log(`🎮 Ejecutando acción: ${action}`, params);

        switch (action) {
            case 'start-autopilot':
                return await this.initializeAutoPilot();

            case 'stop-autopilot':
                if (this.autopilot) {
                    await this.autopilot.stop();
                    this.autopilot = null;
                }
                return { success: true, message: 'Auto-Pilot detenido' };

            case 'restart-component':
                if (this.autopilot && params.component) {
                    // Trigger recovery
                    this.autopilot.emit('component-failed', { name: params.component });
                }
                return { success: true, message: `Reinicio solicitado para ${params.component}` };

            case 'create-backup':
                if (this.autopilot) {
                    await this.autopilot.createBackup('manual');
                }
                return { success: true, message: 'Backup creado' };

            case 'optimize-resources':
                if (this.autopilot) {
                    await this.autopilot.optimizeResources();
                }
                return { success: true, message: 'Optimización ejecutada' };

            case 'generate-report':
                if (this.autopilot) {
                    const report = await this.autopilot.createReport();
                    return { success: true, report };
                }
                break;

            case 'update-system':
                if (this.autopilot) {
                    await this.autopilot.checkForUpdates();
                }
                return { success: true, message: 'Verificación de actualizaciones ejecutada' };

            default:
                throw new Error(`Acción desconocida: ${action}`);
        }

        return { success: false, message: 'Acción no implementada' };
    }

    startLogStream() {
        if (this.logStream) {
            clearInterval(this.logStream);
        }

        this.logStream = setInterval(async () => {
            const logs = await this.getRecentLogs();
            this.broadcastToAll('logs-update', logs);
        }, 5000); // Cada 5 segundos
    }
}

// Crear directorio para la UI del dashboard
async function createDashboardUI() {
    const uiDir = path.join(__dirname, 'dashboard-ui');

    try {
        await fs.mkdir(uiDir, { recursive: true });
    } catch (error) {
        // Ya existe
    }

    // Crear archivo HTML principal
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Pilot Dashboard - Ecosistema Code GPT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        .metric-card {
            @apply bg-white rounded-lg shadow-md p-6 transition-all duration-300;
        }
        .status-indicator {
            @apply w-3 h-3 rounded-full;
        }
        .status-running { @apply bg-green-500; }
        .status-failed { @apply bg-red-500; }
        .status-warning { @apply bg-yellow-500; }
        .log-line {
            @apply font-mono text-sm border-l-2 pl-3 py-1;
        }
        .log-error { @apply border-red-500 text-red-700; }
        .log-warn { @apply border-yellow-500 text-yellow-700; }
        .log-info { @apply border-blue-500 text-blue-700; }
        .log-debug { @apply border-gray-500 text-gray-700; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen" x-data="dashboard()" x-init="init()">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-white font-bold text-sm">AP</span>
                    </div>
                    <div>
                        <h1 class="text-xl font-semibold text-gray-900">Auto-Pilot Dashboard</h1>
                        <p class="text-sm text-gray-500">Ecosistema Code GPT - Control Autónomo</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <div class="text-sm font-medium" x-text="formatUptime(status.performance?.uptime)"></div>
                        <div class="text-xs text-gray-500">Tiempo activo</div>
                    </div>
                    <button @click="toggleConnection()"
                            :class="connected ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                            class="px-4 py-2 rounded-lg text-white text-sm transition-colors">
                        <span x-show="connected">Conectado</span>
                        <span x-show="!connected">Desconectado</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Control Panel -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <!-- System Status -->
            <div class="lg:col-span-1">
                <div class="metric-card">
                    <h3 class="text-lg font-semibold mb-4">Estado del Sistema</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">Auto-Pilot</span>
                            <div :class="status.isActive ? 'status-running' : 'status-failed'" class="status-indicator"></div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">CPU</span>
                            <span class="text-sm font-medium" x-text="metrics.system?.cpu?.toFixed(1) + '%' || '0%'"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">Memoria</span>
                            <span class="text-sm font-medium" x-text="metrics.system?.memory?.toFixed(1) + '%' || '0%'"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">Sesiones</span>
                            <span class="text-sm font-medium" x-text="status.sessions?.size || 0"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Controls -->
            <div class="lg:col-span-3">
                <div class="metric-card">
                    <h3 class="text-lg font-semibold mb-4">Control Rápido</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button @click="executeAction('start-autopilot')"
                                :disabled="status.isActive"
                                class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            🚀 Iniciar
                        </button>
                        <button @click="executeAction('create-backup')"
                                class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            💾 Backup
                        </button>
                        <button @click="executeAction('optimize-resources')"
                                class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            ⚡ Optimizar
                        </button>
                        <button @click="executeAction('generate-report')"
                                class="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            📊 Reporte
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Components Status -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="metric-card">
                <h3 class="text-lg font-semibold mb-4">Componentes</h3>
                <div class="space-y-3">
                    <template x-for="component in getComponents()" :key="component.name">
                        <div class="flex items-center justify-between py-2 border-b border-gray-100">
                            <div class="flex items-center">
                                <div :class="getComponentStatusClass(component.status)" class="status-indicator mr-3"></div>
                                <span class="font-medium" x-text="component.name"></span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-500" x-text="component.status"></span>
                                <button @click="restartComponent(component.name)"
                                        class="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                                    Reiniciar
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- System Metrics -->
            <div class="metric-card">
                <h3 class="text-lg font-semibold mb-4">Métricas del Sistema</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>CPU</span>
                            <span x-text="metrics.system?.cpu?.toFixed(1) + '%' || '0%'"></span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full transition-all duration-300"
                                 :style="'width: ' + (metrics.system?.cpu || 0) + '%'"
                                 :class="getMetricBarClass(metrics.system?.cpu || 0, 80)"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>Memoria</span>
                            <span x-text="metrics.system?.memory?.toFixed(1) + '%' || '0%'"></span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full transition-all duration-300"
                                 :style="'width: ' + (metrics.system?.memory || 0) + '%'"
                                 :class="getMetricBarClass(metrics.system?.memory || 0, 85)"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>Disco</span>
                            <span x-text="metrics.system?.disk + '%' || '0%'"></span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full transition-all duration-300"
                                 :style="'width: ' + (metrics.system?.disk || 0) + '%'"
                                 :class="getMetricBarClass(metrics.system?.disk || 0, 90)"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Logs and Alerts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Live Logs -->
            <div class="metric-card">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Logs en Vivo</h3>
                    <button @click="clearLogs()" class="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                        Limpiar
                    </button>
                </div>
                <div class="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                    <template x-for="log in logs" :key="log.id">
                        <div :class="'log-line ' + getLogClass(log.level)" x-text="log.content"></div>
                    </template>
                </div>
            </div>

            <!-- Active Alerts -->
            <div class="metric-card">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Alertas Activas</h3>
                    <div class="flex space-x-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                </div>
                <div class="space-y-3 max-h-64 overflow-y-auto">
                    <template x-for="alert in alerts" :key="alert.id">
                        <div :class="'p-3 rounded-lg border-l-4 ' + getAlertClass(alert.severity)">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium" x-text="alert.message"></p>
                                    <p class="text-sm text-gray-600" x-text="alert.component + ' • ' + formatTime(alert.timestamp)"></p>
                                </div>
                                <button @click="dismissAlert(alert.id)" class="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </template>
                    <div x-show="alerts.length === 0" class="text-center text-gray-500 py-8">
                        No hay alertas activas
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        function dashboard() {
            return {
                connected: false,
                status: { isActive: false, components: new Map(), performance: {} },
                metrics: {},
                logs: [],
                alerts: [],
                ws: null,

                init() {
                    this.connectWebSocket();
                    this.loadInitialData();
                },

                connectWebSocket() {
                    this.ws = new WebSocket('ws://localhost:8081');

                    this.ws.onopen = () => {
                        this.connected = true;
                        console.log('Conectado al dashboard');
                    };

                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    };

                    this.ws.onclose = () => {
                        this.connected = false;
                        console.log('Desconectado del dashboard');
                        setTimeout(() => this.connectWebSocket(), 5000);
                    };
                },

                handleMessage(data) {
                    switch (data.type) {
                        case 'status-update':
                            this.status = data.data;
                            break;
                        case 'logs-update':
                            this.logs = data.data.slice(-50); // Últimos 50 logs
                            break;
                        case 'alert':
                            this.alerts.unshift(data.data);
                            this.showNotification(data.data);
                            break;
                        case 'initial-status':
                            this.status = data.data;
                            break;
                    }
                },

                async loadInitialData() {
                    try {
                        const [statusRes, metricsRes, logsRes, alertsRes] = await Promise.all([
                            fetch('/api/status'),
                            fetch('/api/metrics'),
                            fetch('/api/logs'),
                            fetch('/api/alerts')
                        ]);

                        const status = await statusRes.json();
                        const metrics = await metricsRes.json();
                        const logs = await logsRes.json();
                        const alerts = await alertsRes.json();

                        this.status = status;
                        this.metrics = metrics;
                        this.logs = logs;
                        this.alerts = alerts;
                    } catch (error) {
                        console.error('Error cargando datos iniciales:', error);
                    }
                },

                async executeAction(action, params = {}) {
                    try {
                        const response = await fetch(\`/api/control/\${action}\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(params)
                        });

                        const result = await response.json();
                        if (result.success) {
                            this.showNotification({
                                type: 'success',
                                message: result.message || 'Acción ejecutada correctamente',
                                severity: 'info'
                            });
                        } else {
                            throw new Error(result.message || 'Error ejecutando acción');
                        }
                    } catch (error) {
                        this.showNotification({
                            type: 'error',
                            message: error.message,
                            severity: 'error'
                        });
                    }
                },

                toggleConnection() {
                    if (this.connected) {
                        this.ws.close();
                    } else {
                        this.connectWebSocket();
                    }
                },

                getComponents() {
                    return Array.from(this.status.components?.entries() || []).map(([name, component]) => ({
                        name: name,
                        status: component.status,
                        uptime: component.startTime ? Date.now() - new Date(component.startTime).getTime() : 0
                    }));
                },

                getComponentStatusClass(status) {
                    switch (status) {
                        case 'running': return 'status-running';
                        case 'failed': return 'status-failed';
                        default: return 'status-warning';
                    }
                },

                getMetricBarClass(value, threshold) {
                    if (value >= threshold) return 'bg-red-500';
                    if (value >= threshold * 0.7) return 'bg-yellow-500';
                    return 'bg-green-500';
                },

                getLogClass(level) {
                    return \`log-\${level}\`;
                },

                getAlertClass(severity) {
                    switch (severity) {
                        case 'critical': return 'bg-red-50 border-red-500';
                        case 'high': return 'bg-orange-50 border-orange-500';
                        case 'medium': return 'bg-yellow-50 border-yellow-500';
                        default: return 'bg-blue-50 border-blue-500';
                    }
                },

                formatUptime(uptime) {
                    if (!uptime) return '0s';
                    const seconds = Math.floor(uptime / 1000);
                    const minutes = Math.floor(seconds / 60);
                    const hours = Math.floor(minutes / 60);

                    if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
                    if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
                    return \`\${seconds}s\`;
                },

                formatTime(timestamp) {
                    return new Date(timestamp).toLocaleTimeString();
                },

                showNotification(alert) {
                    // Crear notificación del navegador
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(alert.message, {
                            icon: '/favicon.ico',
                            badge: '/badge-icon.ico'
                        });
                    }
                },

                clearLogs() {
                    this.logs = [];
                },

                dismissAlert(alertId) {
                    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
                },

                restartComponent(componentName) {
                    this.executeAction('restart-component', { component: componentName });
                }
            }
        }
    </script>
</body>
</html>
`;

    await fs.writeFile(path.join(uiDir, 'index.html'), htmlContent);
    console.log('✅ Dashboard UI creado');
}

async function main() {
    console.log('🚀 Iniciando Dashboard de Auto-Pilot...');

    // Crear UI del dashboard
    await createDashboardUI();

    // Iniciar dashboard
    const dashboard = new AutoDashboard(8080);

    // Manejar señales
    process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo dashboard...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Deteniendo dashboard...');
        process.exit(0);
    });

    console.log('🎯 Dashboard iniciado correctamente');
    console.log('🌐 http://localhost:8080');
    console.log('📡 WebSocket en puerto 8081');
    console.log('💡 Monitoreo en tiempo real activado');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoDashboard;