#!/usr/bin/env node

const AutomationOrchestrator = require('../automation/orchestrator');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

async function syncWithGPT() {
  logger.info('Iniciando sincronización manual con GPT...');
  
  const orchestrator = new AutomationOrchestrator();
  await orchestrator.initialize();
  
  try {
    const result = await orchestrator.executeTask('sync-gpt', {
      manual: true,
      timestamp: new Date().toISOString()
    });
    
    logger.info('Sincronización completada:', result);
    process.exit(0);
  } catch (error) {
    logger.error('Error en sincronización:', error);
    process.exit(1);
  }
}

syncWithGPT();