/**
 * Integración con Cursor Desktop App
 * Este módulo gestiona la comunicación y sincronización con la aplicación de escritorio Cursor
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class CursorIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 3002,
      reconnectInterval: config.reconnectInterval || 5000,
      ...config
    };

    this.ws = null;
    this.isConnected = false;
    this.sessionId = null;
    this.projectState = {
      files: new Map(),
      activeFile: null,
      cursorPosition: { line: 0, column: 0 },
      selections: [],
      diagnostics: []
    };

    this.init();
  }

  init() {
    this.connect();
    this.setupEventHandlers();
  }

  connect() {
    try {
      const wsUrl = `ws://${this.config.host}:${this.config.port}`;
      console.log(`Connecting to Cursor at ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('Connected to Cursor Desktop App');
        this.isConnected = true;
        this.emit('connected');
        this.authenticate();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message from Cursor:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('Disconnected from Cursor Desktop App');
        this.isConnected = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('Error connecting to Cursor:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect to Cursor...');
      this.connect();
    }, this.config.reconnectInterval);
  }

  authenticate() {
    const authMessage = {
      type: 'AUTHENTICATE',
      payload: {
        client: 'code-assistant',
        version: '1.0.0',
        capabilities: [
          'code-analysis',
          'real-time-sync',
          'diagnostics',
          'refactoring',
          'documentation'
        ]
      }
    };

    this.send(authMessage);
  }

  setupEventHandlers() {
    this.on('connected', () => {
      console.log('Cursor integration ready');
    });

    this.on('disconnected', () => {
      console.log('Cursor integration lost');
    });

    this.on('project-loaded', (project) => {
      this.handleProjectLoad(project);
    });

    this.on('file-changed', (change) => {
      this.handleFileChange(change);
    });

    this.on('cursor-moved', (position) => {
      this.handleCursorMove(position);
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'AUTH_SUCCESS':
        console.log('Successfully authenticated with Cursor');
        this.sessionId = message.payload.sessionId;
        break;

      case 'PROJECT_STATE':
        this.updateProjectState(message.payload);
        break;

      case 'FILE_CONTENT':
        this.updateFileContent(message.payload);
        break;

      case 'DIAGNOSTICS_UPDATE':
        this.updateDiagnostics(message.payload);
        break;

      case 'CURSOR_POSITION':
        this.updateCursorPosition(message.payload);
        break;

      case 'SELECTION_CHANGED':
        this.updateSelection(message.payload);
        break;

      case 'EXECUTE_COMMAND':
        this.executeCommand(message.payload);
        break;

      case 'REQUEST_IMPROVEMENT':
        this.handleImprovementRequest(message.payload);
        break;

      case 'ERROR':
        console.error('Error from Cursor:', message.payload);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }

    // Emitir evento para que otros módulos puedan reaccionar
    this.emit('cursor-message', message);
  }

  updateProjectState(state) {
    console.log('Updating project state');
    this.projectState = { ...this.projectState, ...state };

    // Notificar sobre archivos cargados
    if (state.files) {
      state.files.forEach(file => {
        this.emit('file-loaded', file);
      });
    }

    this.emit('project-updated', this.projectState);
  }

  updateFileContent(payload) {
    const { filePath, content, version } = payload;

    this.projectState.files.set(filePath, {
      content,
      version,
      lastModified: Date.now()
    });

    this.emit('file-content-updated', { filePath, content, version });
  }

  updateDiagnostics(payload) {
    const { filePath, diagnostics } = payload;

    this.projectState.diagnostics = this.projectState.diagnostics.filter(
      d => d.filePath !== filePath
    );

    this.projectState.diagnostics.push(...diagnostics.map(d => ({
      ...d,
      filePath
    })));

    this.emit('diagnostics-updated', { filePath, diagnostics });
  }

  updateCursorPosition(payload) {
    const { filePath, position } = payload;
    this.projectState.cursorPosition = position;
    this.projectState.activeFile = filePath;

    this.emit('cursor-position-updated', { filePath, position });
  }

  updateSelection(payload) {
    const { filePath, selections } = payload;
    this.projectState.selections = selections;

    this.emit('selection-updated', { filePath, selections });
  }

  handleProjectLoad(project) {
    console.log('Project loaded in Cursor:', project.name);

    // Sincronizar estado inicial
    const syncMessage = {
      type: 'SYNC_REQUEST',
      payload: {
        sessionId: this.sessionId,
        requestType: 'INITIAL_STATE'
      }
    };

    this.send(syncMessage);
  }

  handleFileChange(change) {
    console.log('File change detected:', change.filePath);

    // Solicitar análisis del archivo cambiado
    if (change.type === 'MODIFIED' || change.type === 'CREATED') {
      this.requestAnalysis(change.filePath);
    }
  }

  handleCursorMove(position) {
    // Proporcionar sugerencias basadas en la posición del cursor
    if (this.projectState.activeFile) {
      this.provideContextualSuggestions(this.projectState.activeFile, position);
    }
  }

  executeCommand(command) {
    console.log('Executing command:', command.name);

    // Implementar comandos específicos
    switch (command.name) {
      case 'ANALYZE_CURRENT_FILE':
        if (this.projectState.activeFile) {
          this.requestAnalysis(this.projectState.activeFile);
        }
        break;

      case 'FORMAT_CODE':
        if (this.projectState.activeFile) {
          this.requestFormatting(this.projectState.activeFile);
        }
        break;

      case 'RUN_TESTS':
        this.runTestsForCurrentFile();
        break;

      case 'GENERATE_DOCS':
        if (this.projectState.activeFile) {
          this.generateDocumentation(this.projectState.activeFile);
        }
        break;

      case 'REFACTOR_CODE':
        if (this.projectState.activeFile) {
          this.requestRefactoring(this.projectState.activeFile);
        }
        break;

      default:
        console.log('Unknown command:', command.name);
    }
  }

  handleImprovementRequest(request) {
    console.log('Improvement request received:', request);

    this.emit('improvement-requested', request);

    // Procesar la solicitud de mejora
    if (request.filePath && request.improvements) {
      this.processImprovementRequest(request);
    }
  }

  // Métodos de solicitud de acciones

  requestAnalysis(filePath) {
    const message = {
      type: 'REQUEST_ANALYSIS',
      payload: {
        sessionId: this.sessionId,
        filePath,
        analysisTypes: ['syntax', 'style', 'performance', 'security']
      }
    };

    this.send(message);
  }

  requestFormatting(filePath) {
    const message = {
      type: 'REQUEST_FORMATTING',
      payload: {
        sessionId: this.sessionId,
        filePath,
        options: {
          insertSpaces: true,
          tabSize: 2
        }
      }
    };

    this.send(message);
  }

  runTestsForCurrentFile() {
    const message = {
      type: 'RUN_TESTS',
      payload: {
        sessionId: this.sessionId,
        scope: 'current-file',
        options: {
          verbose: true,
          coverage: true
        }
      }
    };

    this.send(message);
  }

  generateDocumentation(filePath) {
    const message = {
      type: 'GENERATE_DOCS',
      payload: {
        sessionId: this.sessionId,
        filePath,
        format: 'markdown',
        includeExamples: true
      }
    };

    this.send(message);
  }

  requestRefactoring(filePath) {
    const message = {
      type: 'REQUEST_REFACTORING',
      payload: {
        sessionId: this.sessionId,
        filePath,
        refactoringType: 'auto',
        options: {
          improveReadability: true,
          optimizePerformance: true,
          addErrorHandling: true
        }
      }
    };

    this.send(message);
  }

  provideContextualSuggestions(filePath, position) {
    const message = {
      type: 'CONTEXTUAL_SUGGESTIONS',
      payload: {
        sessionId: this.sessionId,
        filePath,
        position,
        context: this.getContextAroundPosition(filePath, position)
      }
    };

    this.send(message);
  }

  getContextAroundPosition(filePath, position, lines = 5) {
    const file = this.projectState.files.get(filePath);
    if (!file) return '';

    const allLines = file.content.split('\n');
    const start = Math.max(0, position.line - lines);
    const end = Math.min(allLines.length, position.line + lines + 1);

    return allLines.slice(start, end).join('\n');
  }

  processImprovementRequest(request) {
    // Implementar lógica de procesamiento de mejoras
    console.log('Processing improvement request for:', request.filePath);

    // Podría incluir:
    // 1. Análisis del código actual
    // 2. Aplicación de mejoras específicas
    // 3. Validación de los cambios
    // 4. Reporte de resultados

    this.emit('improvement-processing', request);
  }

  // Métodos públicos para integración

  getCurrentFile() {
    return {
      path: this.projectState.activeFile,
      content: this.projectState.files.get(this.projectState.activeFile)?.content || '',
      position: this.projectState.cursorPosition
    };
  }

  getAllFiles() {
    return Array.from(this.projectState.files.entries()).map(([path, file]) => ({
      path,
      ...file
    }));
  }

  getDiagnostics() {
    return this.projectState.diagnostics;
  }

  // Método para desconectar
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = CursorIntegration;