const GPTClient = require('./gpt/client');
const CursorClient = require('./cursor/client');

class IntegrationManager {
  constructor() {
    this.gpt = new GPTClient();
    this.cursor = new CursorClient();
    this.integrations = new Map();
    
    // Registrar integraciones por defecto
    this.register('gpt', this.gpt);
    this.register('cursor', this.cursor);
  }

  register(name, client) {
    this.integrations.set(name, client);
    console.log(`Integration registered: ${name}`);
  }

  get(name) {
    return this.integrations.get(name);
  }

  async syncAll(data = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      integrations: {}
    };

    for (const [name, client] of this.integrations) {
      try {
        if (client.sync && typeof client.sync === 'function') {
          results.integrations[name] = await client.sync(data);
        }
      } catch (error) {
        results.integrations[name] = {
          error: error.message,
          success: false
        };
      }
    }

    return results;
  }

  // Método para coordinar acciones entre integraciones
  async coordinate(action, params = {}) {
    switch (action) {
      case 'generateAndSync':
        return await this.generateAndSync(params);
      
      case 'analyzeAndImprove':
        return await this.analyzeAndImprove(params);
      
      case 'bidirectionalSync':
        return await this.bidirectionalSync(params);
      
      default:
        throw new Error(`Unknown coordination action: ${action}`);
    }
  }

  async generateAndSync(params) {
    const { prompt, language = 'javascript', targetPath } = params;
    
    // 1. Generar código con GPT
    const generatedCode = await this.gpt.generateCode(prompt, language);
    
    // 2. Sincronizar con Cursor
    const syncResult = await this.cursor.syncFile(
      targetPath || `generated/${Date.now()}.${language}`,
      generatedCode[0].code
    );
    
    return {
      generated: generatedCode,
      synced: syncResult
    };
  }

  async analyzeAndImprove(params) {
    const { filePath, analysisType = 'general' } = params;
    
    // 1. Leer archivo
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    
    // 2. Analizar con GPT
    const analysis = await this.gpt.analyzeCode(content, analysisType);
    
    // 3. Obtener sugerencias de mejora
    if (analysis.suggestions.length > 0) {
      const improvements = await this.gpt.suggestImprovements(
        content,
        analysis.suggestions.join('; ')
      );
      
      // 4. Sincronizar mejoras con Cursor
      if (improvements.improvedCode.length > 0) {
        const improvedPath = filePath.replace(/(\.\w+)$/, '.improved$1');
        await this.cursor.syncFile(improvedPath, improvements.improvedCode[0].code);
      }
      
      return {
        analysis,
        improvements,
        synced: true
      };
    }
    
    return { analysis, improvements: null, synced: false };
  }

  async bidirectionalSync(params) {
    const { sourceDir, targetDir } = params;
    
    // 1. Sincronizar desde origen a Cursor
    const cursorSync = await this.cursor.syncDirectory(sourceDir);
    
    // 2. Analizar archivos sincronizados
    const analysisResults = [];
    
    for (const file of cursorSync.syncedFiles) {
      if (file.success && file.sourcePath.match(/\.(js|ts|py)$/)) {
        try {
          const content = await require('fs').promises.readFile(file.sourcePath, 'utf-8');
          const analysis = await this.gpt.analyzeCode(content, 'general');
          
          analysisResults.push({
            file: file.sourcePath,
            analysis: analysis.summary
          });
        } catch (error) {
          // Ignorar errores de análisis individual
        }
      }
    }
    
    return {
      syncedToCursor: cursorSync.summary,
      analyzed: analysisResults.length,
      results: analysisResults
    };
  }

  // Método para crear webhooks de integración
  async setupWebhooks() {
    const express = require('express');
    const app = express();
    app.use(express.json());

    // Webhook para GPT
    app.post('/webhook/gpt', async (req, res) => {
      try {
        const { action, data } = req.body;
        console.log('GPT webhook received:', action);
        
        // Procesar acción
        const result = await this.processGPTWebhook(action, data);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Webhook para Cursor
    app.post('/webhook/cursor', async (req, res) => {
      try {
        const { action, data } = req.body;
        console.log('Cursor webhook received:', action);
        
        // Procesar acción
        const result = await this.processCursorWebhook(action, data);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    const port = process.env.WEBHOOK_PORT || 3003;
    app.listen(port, () => {
      console.log(`Integration webhooks listening on port ${port}`);
    });

    return app;
  }

  async processGPTWebhook(action, data) {
    switch (action) {
      case 'codeGenerated':
        // Sincronizar automáticamente con Cursor
        return await this.cursor.syncFile(data.path, data.content);
      
      case 'analysisComplete':
        // Procesar resultados de análisis
        return { processed: true, action };
      
      default:
        return { unknown: true, action };
    }
  }

  async processCursorWebhook(action, data) {
    switch (action) {
      case 'fileChanged':
        // Analizar archivo cambiado con GPT
        return await this.gpt.analyzeCode(data.content, 'general');
      
      case 'syncRequested':
        // Procesar solicitud de sincronización
        return await this.syncAll(data);
      
      default:
        return { unknown: true, action };
    }
  }
}

module.exports = IntegrationManager;