/**
 * API Gateway para el Ecosistema de Desarrollo Code GPT
 * Este gateway actúa como punto central de comunicación entre:
 * - Code GPT (generador de código)
 * - Code Assistant (refinador de código)
 * - Cursor Desktop App (IDE)
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

class APIGateway {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.sessions = new Map();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Session management
    this.app.post('/session', (req, res) => {
      const sessionId = uuidv4();
      const session = {
        id: sessionId,
        created: new Date().toISOString(),
        status: 'active',
        components: {}
      };
      this.sessions.set(sessionId, session);
      res.json(session);
    });

    // Code transfer from Code GPT to Code Assistant
    this.app.post('/transfer/code', async (req, res) => {
      try {
        const { sessionId, source, code, metadata } = req.body;

        if (!this.sessions.has(sessionId)) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const session = this.sessions.get(sessionId);

        // Validate code before transfer
        const validationResult = await this.validateCode(code, metadata);

        if (!validationResult.valid) {
          return res.status(400).json({
            error: 'Code validation failed',
            issues: validationResult.issues
          });
        }

        // Package code for transfer
        const package = {
          id: uuidv4(),
          sessionId,
          source,
          code,
          metadata,
          timestamp: new Date().toISOString(),
          validation: validationResult
        };

        // Store package
        session.components.codePackage = package;

        // Notify Code Assistant
        await this.notifyComponent('code_assistant', {
          type: 'CODE_RECEIVED',
          package
        });

        res.json({
          status: 'success',
          packageId: package.id,
          message: 'Code transferred successfully'
        });

      } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Transfer failed', details: error.message });
      }
    });

    // Code improvement request
    this.app.post('/improve/code', async (req, res) => {
      try {
        const { sessionId, improvements, priority = 'medium' } = req.body;

        if (!this.sessions.has(sessionId)) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const session = this.sessions.get(sessionId);
        const package = session.components.codePackage;

        if (!package) {
          return res.status(400).json({ error: 'No code package available' });
        }

        const improvementRequest = {
          id: uuidv4(),
          sessionId,
          packageId: package.id,
          improvements,
          priority,
          timestamp: new Date().toISOString()
        };

        // Notify Code Assistant
        await this.notifyComponent('code_assistant', {
          type: 'IMPROVEMENT_REQUEST',
          request: improvementRequest
        });

        res.json({
          status: 'success',
          requestId: improvementRequest.id
        });

      } catch (error) {
        console.error('Improvement request error:', error);
        res.status(500).json({ error: 'Request failed', details: error.message });
      }
    });

    // Get session status
    this.app.get('/session/:sessionId', (req, res) => {
      const { sessionId } = req.params;
      const session = this.sessions.get(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    });

    // Feedback submission
    this.app.post('/feedback', async (req, res) => {
      try {
        const { sessionId, component, type, content, metadata } = req.body;

        const feedback = {
          id: uuidv4(),
          sessionId,
          component,
          type,
          content,
          metadata,
          timestamp: new Date().toISOString()
        };

        // Store feedback
        if (!this.sessions.has(sessionId)) {
          this.sessions.set(sessionId, { feedback: [] });
        }
        const session = this.sessions.get(sessionId);
        if (!session.feedback) session.feedback = [];
        session.feedback.push(feedback);

        // Process feedback based on type
        await this.processFeedback(feedback);

        res.json({ status: 'success', feedbackId: feedback.id });

      } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ error: 'Feedback processing failed' });
      }
    });
  }

  setupWebSocket() {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 3001 });

    wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
      });
    });
  }

  async validateCode(code, metadata) {
    // Basic validation
    const issues = [];

    if (!code || typeof code !== 'string') {
      issues.push('Code is required and must be a string');
    }

    if (!metadata || !metadata.language) {
      issues.push('Language metadata is required');
    }

    // TODO: Add more sophisticated validation
    // - Syntax checking
    // - Security scanning
    // - Dependency analysis

    return {
      valid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - issues.length * 10)
    };
  }

  async notifyComponent(component, message) {
    // In a real implementation, this would send HTTP requests
    // or WebSocket messages to the respective components
    console.log(`Notifying ${component}:`, message);

    // Simulate component notification
    // This would be replaced with actual API calls
    return Promise.resolve({ status: 'sent', component });
  }

  async processFeedback(feedback) {
    console.log('Processing feedback:', feedback);

    // Implement feedback processing logic
    // - Analyze feedback patterns
    // - Update component behaviors
    // - Trigger improvements
  }

  async handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'SESSION_JOIN':
        ws.sessionId = data.sessionId;
        ws.send(JSON.stringify({
          type: 'SESSION_JOINED',
          sessionId: data.sessionId
        }));
        break;

      case 'CODE_UPDATE':
        // Broadcast code updates to all clients in session
        // (except sender)
        break;

      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`API Gateway running on port ${this.port}`);
      console.log(`WebSocket server running on port 3001`);
    });
  }
}

// Start the gateway if this file is run directly
if (require.main === module) {
  const gateway = new APIGateway();
  gateway.start();
}

module.exports = APIGateway;