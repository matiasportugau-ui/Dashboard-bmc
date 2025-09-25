#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
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

const argv = yargs(hideBin(process.argv))
  .command('$0 <template> <name>', 'Generar un template', (yargs) => {
    yargs
      .positional('template', {
        describe: 'Tipo de template a generar',
        type: 'string',
        choices: ['react-component', 'node-api', 'python-class']
      })
      .positional('name', {
        describe: 'Nombre del componente/módulo',
        type: 'string'
      });
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Directorio de salida',
    default: './generated'
  })
  .option('description', {
    alias: 'd',
    type: 'string',
    description: 'Descripción del componente'
  })
  .help()
  .argv;

async function generateTemplate() {
  const { template, name, output, description } = argv;
  
  logger.info(`Generando template ${template} con nombre ${name}...`);
  
  const orchestrator = new AutomationOrchestrator();
  await orchestrator.initialize();
  
  try {
    const result = await orchestrator.executeTask('template-generator', {
      template,
      name,
      outputDir: output,
      options: {
        description: description || `${name} component`
      }
    });
    
    logger.info('Template generado exitosamente:', result);
    process.exit(0);
  } catch (error) {
    logger.error('Error generando template:', error);
    process.exit(1);
  }
}

generateTemplate();