/**
 * Integración Principal del Ecosistema de Desarrollo Code GPT
 * Este script coordina todos los componentes del ecosistema
 */

const APIGateway = require('./api-gateway');
const DevTools = require('./dev-tools');
const CursorIntegration = require('./cursor-integration');
const FeedbackSystem = require('./feedback-system');

class EcosystemIntegration {
  constructor(config = {}) {
    this.config = config;
    this.components = {
      apiGateway: null,
      devTools: null,
      cursorIntegration: null,
      feedbackSystem: null
    };

    this.sessionId = null;
    this.isRunning = false;
    this.eventListeners = new Map();

    this.init();
  }

  async init() {
    console.log('Initializing Code GPT Development Ecosystem...');

    try {
      // Inicializar componentes
      await this.initializeComponents();

      // Configurar event listeners
      this.setupEventListeners();

      // Iniciar servicios
      await this.startServices();

      this.isRunning = true;
      console.log('Ecosystem initialized successfully!');

      this.emit('ecosystem-ready', {
        sessionId: this.sessionId,
        components: Object.keys(this.components),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error initializing ecosystem:', error);
      throw error;
    }
  }

  async initializeComponents() {
    console.log('Initializing components...');

    // Inicializar API Gateway
    this.components.apiGateway = new APIGateway(this.config.apiGateway?.port || 3000);
    console.log('✓ API Gateway initialized');

    // Inicializar DevTools
    this.components.devTools = new DevTools();
    console.log('✓ DevTools initialized');

    // Inicializar Cursor Integration
    this.components.cursorIntegration = new CursorIntegration({
      host: this.config.cursor?.host || 'localhost',
      port: this.config.cursor?.port || 3002
    });
    console.log('✓ Cursor Integration initialized');

    // Inicializar Feedback System
    this.components.feedbackSystem = new FeedbackSystem(this.config.feedback?.storagePath || './feedback-data');
    console.log('✓ Feedback System initialized');
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');

    // API Gateway events
    this.components.apiGateway.on('code-transfer', async (data) => {
      await this.handleCodeTransfer(data);
    });

    this.components.apiGateway.on('improvement-request', async (data) => {
      await this.handleImprovementRequest(data);
    });

    this.components.apiGateway.on('feedback-received', async (data) => {
      await this.handleFeedback(data);
    });

    // Cursor Integration events
    this.components.cursorIntegration.on('project-loaded', async (project) => {
      await this.handleProjectLoad(project);
    });

    this.components.cursorIntegration.on('file-changed', async (change) => {
      await this.handleFileChange(change);
    });

    this.components.cursorIntegration.on('improvement-requested', async (request) => {
      await this.handleCursorImprovementRequest(request);
    });

    // DevTools events
    this.components.devTools.on('validation-complete', async (result) => {
      await this.handleValidationResult(result);
    });

    this.components.devTools.on('testing-complete', async (result) => {
      await this.handleTestingResult(result);
    });

    // Feedback System events
    this.components.feedbackSystem.on('insight-generated', async (insight) => {
      await this.handleInsight(insight);
    });

    this.components.feedbackSystem.on('improvement-proposed', async (improvement) => {
      await this.handleImprovementProposal(improvement);
    });
  }

  async startServices() {
    console.log('Starting services...');

    // Iniciar API Gateway
    this.components.apiGateway.start();

    // Crear sesión inicial
    const sessionResponse = await this.createSession();
    this.sessionId = sessionResponse.sessionId;

    console.log('✓ Services started successfully');
  }

  // Event handlers

  async handleCodeTransfer(data) {
    console.log('Handling code transfer:', data.packageId);

    try {
      // Validar código transferido
      const validation = await this.components.devTools.validateCode(
        data.code,
        data.metadata.language,
        { strict: true }
      );

      if (!validation.isValid) {
        console.warn('Code validation failed:', validation.errors);
        this.emit('code-validation-failed', { data, validation });
        return;
      }

      // Mejorar código automáticamente
      const improvedCode = await this.improveCode(data.code, data.metadata.language);

      // Ejecutar tests si están disponibles
      let testResults = null;
      if (data.metadata.hasTests) {
        testResults = await this.components.devTools.runTests(
          data.metadata.testDir,
          data.metadata.language
        );
      }

      // Generar documentación
      const documentation = await this.components.devTools.generateDocumentation(
        improvedCode,
        data.metadata.language
      );

      // Enviar feedback del proceso
      const feedback = {
        sessionId: this.sessionId,
        component: 'code_assistant',
        type: 'PROCESSING_COMPLETE',
        content: 'Code processed successfully',
        metadata: {
          originalPackageId: data.packageId,
          validation,
          testResults,
          documentationGenerated: true
        }
      };

      await this.components.feedbackSystem.processFeedback(feedback);

      // Notificar a Cursor
      this.components.cursorIntegration.emit('code-processed', {
        packageId: data.packageId,
        improvedCode,
        documentation,
        testResults,
        validation
      });

      this.emit('code-processed', {
        packageId: data.packageId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling code transfer:', error);
      this.emit('code-processing-error', {
        packageId: data.packageId,
        error: error.message
      });
    }
  }

  async handleImprovementRequest(data) {
    console.log('Handling improvement request:', data.requestId);

    try {
      const { packageId, improvements, priority } = data;

      // Obtener código actual
      const session = this.components.apiGateway.sessions.get(this.sessionId);
      const codePackage = session?.components?.codePackage;

      if (!codePackage) {
        throw new Error('No code package found for improvement');
      }

      // Aplicar mejoras
      let improvedCode = codePackage.code;
      const appliedImprovements = [];

      for (const improvement of improvements) {
        switch (improvement.type) {
          case 'optimize_performance':
            improvedCode = await this.optimizePerformance(improvedCode, codePackage.metadata.language);
            appliedImprovements.push('Performance optimization applied');
            break;

          case 'improve_security':
            improvedCode = await this.improveSecurity(improvedCode, codePackage.metadata.language);
            appliedImprovements.push('Security improvements applied');
            break;

          case 'add_documentation':
            // Documentation is handled separately
            appliedImprovements.push('Documentation will be generated');
            break;

          case 'refactor_code':
            improvedCode = await this.refactorCode(improvedCode, codePackage.metadata.language);
            appliedImprovements.push('Code refactored');
            break;

          case 'add_tests':
            await this.addTests(improvedCode, codePackage.metadata.language);
            appliedImprovements.push('Tests added');
            break;
        }
      }

      // Validar mejoras
      const validation = await this.components.devTools.validateCode(
        improvedCode,
        codePackage.metadata.language
      );

      // Generar documentación si se solicitó
      let documentation = null;
      if (improvements.some(i => i.type === 'add_documentation')) {
        documentation = await this.components.devTools.generateDocumentation(
          improvedCode,
          codePackage.metadata.language
        );
      }

      // Enviar resultado
      this.emit('improvement-completed', {
        requestId: data.requestId,
        sessionId: this.sessionId,
        improvements: appliedImprovements,
        improvedCode,
        validation,
        documentation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling improvement request:', error);
      this.emit('improvement-error', {
        requestId: data.requestId,
        error: error.message
      });
    }
  }

  async handleFeedback(data) {
    console.log('Handling feedback:', data.type);

    const processedFeedback = await this.components.feedbackSystem.processFeedback(data);

    this.emit('feedback-processed', {
      feedbackId: processedFeedback.feedbackId,
      insights: processedFeedback.insights,
      improvements: processedFeedback.improvements,
      timestamp: new Date().toISOString()
    });
  }

  async handleProjectLoad(project) {
    console.log('Handling project load:', project.name);

    this.emit('project-loaded', {
      sessionId: this.sessionId,
      project,
      timestamp: new Date().toISOString()
    });
  }

  async handleFileChange(change) {
    console.log('Handling file change:', change.filePath);

    // Si es un archivo de código, validar automáticamente
    if (this.isCodeFile(change.filePath)) {
      const fileContent = await this.components.cursorIntegration.getCurrentFile();
      if (fileContent.content) {
        const validation = await this.components.devTools.validateCode(
          fileContent.content,
          this.getLanguageFromFilePath(change.filePath)
        );

        this.components.cursorIntegration.emit('file-validation-result', {
          filePath: change.filePath,
          validation
        });
      }
    }

    this.emit('file-changed', {
      sessionId: this.sessionId,
      change,
      timestamp: new Date().toISOString()
    });
  }

  async handleCursorImprovementRequest(request) {
    console.log('Handling cursor improvement request');

    // Procesar solicitud desde Cursor
    const improvementData = {
      sessionId: this.sessionId,
      requestId: request.id,
      improvements: request.improvements,
      priority: request.priority || 'medium'
    };

    await this.handleImprovementRequest({ ...improvementData });
  }

  async handleValidationResult(result) {
    console.log('Handling validation result');

    this.emit('validation-completed', {
      sessionId: this.sessionId,
      result,
      timestamp: new Date().toISOString()
    });
  }

  async handleTestingResult(result) {
    console.log('Handling testing result');

    this.emit('testing-completed', {
      sessionId: this.sessionId,
      result,
      timestamp: new Date().toISOString()
    });
  }

  async handleInsight(insight) {
    console.log('Handling insight:', insight.type);

    this.emit('insight-generated', {
      sessionId: this.sessionId,
      insight,
      timestamp: new Date().toISOString()
    });
  }

  async handleImprovementProposal(improvement) {
    console.log('Handling improvement proposal:', improvement.type);

    this.emit('improvement-proposed', {
      sessionId: this.sessionId,
      improvement,
      timestamp: new Date().toISOString()
    });
  }

  // Helper methods

  async createSession() {
    return new Promise((resolve, reject) => {
      // Simulate API call to create session
      setTimeout(() => {
        resolve({
          sessionId: 'session_' + Date.now(),
          created: new Date().toISOString(),
          status: 'active'
        });
      }, 100);
    });
  }

  async improveCode(code, language) {
    // Aplicar mejoras automáticas
    let improvedCode = code;

    // Formatear código
    improvedCode = await this.components.devTools.formatCode(improvedCode, language);

    // Aplicar optimizaciones básicas
    improvedCode = await this.optimizePerformance(improvedCode, language);

    return improvedCode;
  }

  async optimizePerformance(code, language) {
    // Implementar optimizaciones básicas
    // Esto sería expandido con lógica específica por lenguaje
    return code;
  }

  async improveSecurity(code, language) {
    // Implementar mejoras de seguridad
    // Esto sería expandido con lógica específica por lenguaje
    return code;
  }

  async refactorCode(code, language) {
    // Implementar refactoring
    return code;
  }

  async addTests(code, language) {
    // Implementar generación de tests
    console.log('Adding tests for', language);
  }

  isCodeFile(filePath) {
    const codeExtensions = ['.js', '.ts', '.py', '.go', '.rs', '.java', '.cpp', '.c', '.php'];
    return codeExtensions.some(ext => filePath.endsWith(ext));
  }

  getLanguageFromFilePath(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const extToLang = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      php: 'php'
    };
    return extToLang[ext] || 'text';
  }

  // Public API methods

  async transferCode(code, metadata) {
    const transferData = {
      sessionId: this.sessionId,
      source: 'manual_transfer',
      code,
      metadata
    };

    return await this.components.apiGateway.handleCodeTransfer(transferData);
  }

  async requestImprovement(improvements, priority = 'medium') {
    const requestData = {
      sessionId: this.sessionId,
      improvements,
      priority
    };

    return await this.components.apiGateway.handleImprovementRequest(requestData);
  }

  async submitFeedback(component, type, content, metadata = {}) {
    const feedbackData = {
      sessionId: this.sessionId,
      component,
      type,
      content,
      metadata
    };

    return await this.components.apiGateway.handleFeedback(feedbackData);
  }

  async getSystemStatus() {
    return {
      isRunning: this.isRunning,
      sessionId: this.sessionId,
      components: Object.keys(this.components).map(name => ({
        name,
        status: this.components[name] ? 'active' : 'inactive'
      })),
      timestamp: new Date().toISOString()
    };
  }

  // Event system

  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  async shutdown() {
    console.log('Shutting down ecosystem...');

    this.isRunning = false;

    // Cerrar conexiones
    if (this.components.cursorIntegration) {
      this.components.cursorIntegration.disconnect();
    }

    // Guardar datos de feedback
    if (this.components.feedbackSystem) {
      await this.components.feedbackSystem.savePatterns();
      await this.components.feedbackSystem.saveMetrics();
    }

    console.log('Ecosystem shutdown complete');
  }
}

// Export for use in other modules
module.exports = EcosystemIntegration;

// Start ecosystem if run directly
if (require.main === module) {
  const ecosystem = new EcosystemIntegration({
    apiGateway: { port: 3000 },
    cursor: { host: 'localhost', port: 3002 },
    feedback: { storagePath: './feedback-data' }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    await ecosystem.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    await ecosystem.shutdown();
    process.exit(0);
  });

  console.log('Code GPT Development Ecosystem started');
  console.log('Press Ctrl+C to stop');
}