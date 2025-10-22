#!/usr/bin/env node

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const winston = require('winston');

class AutomationOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.running = false;
    this.logger = this.createLogger();
  }

  createLogger() {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(__dirname, '../logs/automation.log') 
        })
      ]
    });
  }

  async initialize() {
    this.logger.info('Inicializando Automation Orchestrator...');
    
    // Crear directorio de logs si no existe
    await fs.mkdir(path.join(__dirname, '../logs'), { recursive: true });
    
    // Cargar tareas de automatización
    await this.loadAutomationTasks();
    
    // Configurar listeners
    this.setupEventListeners();
    
    this.logger.info('Orchestrator inicializado correctamente');
  }

  async loadAutomationTasks() {
    const tasksDir = path.join(__dirname, 'tasks');
    
    try {
      const files = await fs.readdir(tasksDir);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const taskModule = require(path.join(tasksDir, file));
          const taskName = path.basename(file, '.js');
          
          if (taskModule.task && typeof taskModule.task === 'function') {
            this.tasks.set(taskName, taskModule);
            this.logger.info(`Tarea cargada: ${taskName}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error cargando tareas: ${error.message}`);
    }
  }

  setupEventListeners() {
    // Listener para sincronización con GPT
    this.on('sync:gpt', async (data) => {
      this.logger.info('Iniciando sincronización con GPT...');
      await this.executeTask('sync-gpt', data);
    });

    // Listener para sincronización con Cursor
    this.on('sync:cursor', async (data) => {
      this.logger.info('Iniciando sincronización con Cursor...');
      await this.executeTask('sync-cursor', data);
    });

    // Listener para análisis de código
    this.on('analyze:code', async (data) => {
      this.logger.info('Iniciando análisis de código...');
      await this.executeTask('code-analysis', data);
    });

    // Listener para generación de templates
    this.on('generate:template', async (data) => {
      this.logger.info('Generando template...');
      await this.executeTask('template-generator', data);
    });
  }

  async executeTask(taskName, data) {
    const task = this.tasks.get(taskName);
    
    if (!task) {
      this.logger.error(`Tarea no encontrada: ${taskName}`);
      return;
    }

    try {
      const result = await task.task(data, this.logger);
      this.emit(`${taskName}:complete`, result);
      this.logger.info(`Tarea completada: ${taskName}`);
      return result;
    } catch (error) {
      this.logger.error(`Error ejecutando tarea ${taskName}: ${error.message}`);
      this.emit(`${taskName}:error`, error);
      throw error;
    }
  }

  async start() {
    if (this.running) {
      this.logger.warn('El orchestrator ya está en ejecución');
      return;
    }

    this.running = true;
    await this.initialize();
    
    // Configurar intervalos de sincronización automática
    if (process.env.AUTO_SYNC_ENABLED === 'true') {
      const syncInterval = parseInt(process.env.SYNC_INTERVAL_MS || '30000');
      
      setInterval(() => {
        this.emit('sync:gpt', { auto: true });
        this.emit('sync:cursor', { auto: true });
      }, syncInterval);
    }

    this.logger.info('Automation Orchestrator iniciado');
  }

  async stop() {
    this.running = false;
    this.logger.info('Automation Orchestrator detenido');
  }
}

// Iniciar el orchestrator si se ejecuta directamente
if (require.main === module) {
  const orchestrator = new AutomationOrchestrator();
  
  // Manejar señales de terminación
  process.on('SIGINT', async () => {
    await orchestrator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await orchestrator.stop();
    process.exit(0);
  });

  // Iniciar
  orchestrator.start().catch(error => {
    console.error('Error iniciando orchestrator:', error);
    process.exit(1);
  });
}

module.exports = AutomationOrchestrator;