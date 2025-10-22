#!/usr/bin/env node

const AutomationOrchestrator = require('./automation/orchestrator');
const IntegrationManager = require('./integrations');
const winston = require('winston');
const express = require('express');
const path = require('path');

// Configurar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs/main.log') 
    })
  ]
});

class CodeDevelopmentEnvironment {
  constructor() {
    this.orchestrator = new AutomationOrchestrator();
    this.integrationManager = new IntegrationManager();
    this.app = null;
    this.server = null;
  }

  async start() {
    logger.info('Starting Code Development Environment...');

    try {
      // Inicializar orchestrator
      await this.orchestrator.start();
      logger.info('Automation Orchestrator started');

      // Configurar servidor web
      await this.setupWebServer();
      
      // Configurar webhooks
      await this.integrationManager.setupWebhooks();
      
      logger.info('Code Development Environment is ready!');
      
      // Mostrar información de estado
      this.displayStatus();
      
    } catch (error) {
      logger.error('Failed to start environment:', error);
      process.exit(1);
    }
  }

  async setupWebServer() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Status endpoint
    this.app.get('/status', async (req, res) => {
      const status = await this.getSystemStatus();
      res.json(status);
    });

    // API endpoints
    this.app.post('/api/sync', async (req, res) => {
      try {
        const { type, options } = req.body;
        
        if (type === 'gpt') {
          this.orchestrator.emit('sync:gpt', options);
        } else if (type === 'cursor') {
          this.orchestrator.emit('sync:cursor', options);
        }
        
        res.json({ success: true, message: `${type} sync initiated` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/analyze', async (req, res) => {
      try {
        const { path: targetPath } = req.body;
        this.orchestrator.emit('analyze:code', { path: targetPath });
        res.json({ success: true, message: 'Analysis initiated' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/generate', async (req, res) => {
      try {
        const { template, name, options } = req.body;
        this.orchestrator.emit('generate:template', { template, name, options });
        res.json({ success: true, message: 'Template generation initiated' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    const port = process.env.PORT || 3000;
    this.server = this.app.listen(port, () => {
      logger.info(`Web server listening on port ${port}`);
    });
  }

  async getSystemStatus() {
    const cursorInfo = await this.integrationManager.cursor.getProjectInfo();
    
    return {
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      integrations: {
        gpt: {
          configured: !!process.env.OPENAI_API_KEY,
          model: process.env.GPT_MODEL || 'gpt-4-turbo-preview'
        },
        cursor: cursorInfo
      },
      automation: {
        running: this.orchestrator.running,
        autoSyncEnabled: process.env.AUTO_SYNC_ENABLED === 'true',
        syncInterval: parseInt(process.env.SYNC_INTERVAL_MS || '30000')
      }
    };
  }

  displayStatus() {
    console.log('\n' + '='.repeat(50));
    console.log('Code Development Environment - Status');
    console.log('='.repeat(50));
    console.log(`Web Interface: http://localhost:${process.env.PORT || 3000}`);
    console.log(`API Endpoint: http://localhost:${process.env.PORT || 3000}/api`);
    console.log(`Health Check: http://localhost:${process.env.PORT || 3000}/health`);
    console.log('='.repeat(50));
    console.log('\nAvailable Commands:');
    console.log('  npm run sync:gpt     - Sync with GPT');
    console.log('  npm run sync:cursor  - Sync with Cursor');
    console.log('  npm run analyze      - Analyze code');
    console.log('  npm run generate:template <type> <name>');
    console.log('\nPress Ctrl+C to stop\n');
  }

  async stop() {
    logger.info('Stopping Code Development Environment...');
    
    if (this.server) {
      this.server.close();
    }
    
    await this.orchestrator.stop();
    
    logger.info('Environment stopped');
  }
}

// Main execution
if (require.main === module) {
  const env = new CodeDevelopmentEnvironment();

  // Handle shutdown signals
  process.on('SIGINT', async () => {
    await env.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await env.stop();
    process.exit(0);
  });

  // Start the environment
  env.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CodeDevelopmentEnvironment;