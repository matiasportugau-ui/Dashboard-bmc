const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const winston = require('winston');

const execAsync = promisify(exec);

class CursorClient {
  constructor() {
    this.workspacePath = process.env.CURSOR_WORKSPACE_PATH;
    this.projectId = process.env.CURSOR_PROJECT_ID;
    this.logger = this.createLogger();
  }

  createLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/cursor-client.log' 
        })
      ]
    });
  }

  async syncFile(filePath, content) {
    try {
      if (!this.workspacePath) {
        throw new Error('CURSOR_WORKSPACE_PATH not configured');
      }

      const relativePath = path.relative(process.cwd(), filePath);
      const targetPath = path.join(this.workspacePath, relativePath);

      // Crear directorio si no existe
      await fs.mkdir(path.dirname(targetPath), { recursive: true });

      // Escribir archivo
      await fs.writeFile(targetPath, content);

      this.logger.info(`File synced to Cursor: ${targetPath}`);

      return {
        success: true,
        sourcePath: filePath,
        targetPath: targetPath
      };
    } catch (error) {
      this.logger.error(`Failed to sync file: ${error.message}`);
      throw error;
    }
  }

  async syncDirectory(dirPath, options = {}) {
    const { 
      exclude = ['node_modules', '.git', 'dist', 'build'],
      includeOnly = null 
    } = options;

    const syncedFiles = [];
    const errors = [];

    async function walkDirectory(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(dirPath, fullPath);

        // Verificar exclusiones
        if (exclude.some(pattern => relativePath.includes(pattern))) {
          continue;
        }

        // Verificar inclusiones
        if (includeOnly && !includeOnly.some(pattern => relativePath.includes(pattern))) {
          continue;
        }

        if (entry.isDirectory()) {
          await walkDirectory(fullPath);
        } else if (entry.isFile()) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const result = await this.syncFile(fullPath, content);
            syncedFiles.push(result);
          } catch (error) {
            errors.push({
              file: fullPath,
              error: error.message
            });
          }
        }
      }
    }

    await walkDirectory(dirPath);

    this.logger.info(`Directory sync completed: ${syncedFiles.length} files synced`);

    return {
      syncedFiles,
      errors,
      summary: {
        total: syncedFiles.length,
        failed: errors.length
      }
    };
  }

  async executeCommand(command, options = {}) {
    const { cwd = this.workspacePath, timeout = 30000 } = options;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout
      });

      this.logger.info(`Command executed: ${command}`);

      return {
        success: true,
        command,
        stdout,
        stderr
      };
    } catch (error) {
      this.logger.error(`Command failed: ${command}`, error);
      throw error;
    }
  }

  async getProjectInfo() {
    if (!this.workspacePath) {
      return {
        configured: false,
        message: 'Cursor workspace not configured'
      };
    }

    try {
      const stats = await fs.stat(this.workspacePath);
      
      // Buscar archivos de configuración de Cursor
      const cursorConfigPath = path.join(this.workspacePath, '.cursor');
      let hasConfig = false;
      
      try {
        await fs.access(cursorConfigPath);
        hasConfig = true;
      } catch {
        // No config found
      }

      return {
        configured: true,
        workspacePath: this.workspacePath,
        projectId: this.projectId,
        exists: stats.isDirectory(),
        hasCursorConfig: hasConfig
      };
    } catch (error) {
      return {
        configured: true,
        workspacePath: this.workspacePath,
        exists: false,
        error: error.message
      };
    }
  }

  async createCursorConfig(config = {}) {
    const defaultConfig = {
      version: '1.0.0',
      projectId: this.projectId || 'code-project',
      settings: {
        autoSync: true,
        syncInterval: 30000,
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**'],
        aiAssistance: {
          enabled: true,
          model: 'gpt-4',
          temperature: 0.7
        }
      },
      integrations: {
        gpt: {
          enabled: true,
          apiEndpoint: process.env.GPT_WEBHOOK_URL
        }
      }
    };

    const finalConfig = { ...defaultConfig, ...config };
    const configPath = path.join(this.workspacePath, '.cursor', 'config.json');

    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(finalConfig, null, 2));

    this.logger.info('Cursor config created');

    return finalConfig;
  }

  async watchForChanges(callback) {
    if (!this.workspacePath) {
      throw new Error('CURSOR_WORKSPACE_PATH not configured');
    }

    const { watch } = require('fs');
    
    const watcher = watch(this.workspacePath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const fullPath = path.join(this.workspacePath, filename);
        
        // Ignorar ciertos archivos
        if (this.shouldIgnoreFile(filename)) {
          return;
        }

        callback({
          type: eventType,
          file: filename,
          fullPath: fullPath,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.logger.info('Started watching Cursor workspace for changes');

    return watcher;
  }

  shouldIgnoreFile(filename) {
    const ignorePatterns = [
      /node_modules/,
      /\.git/,
      /\.cursor\/cache/,
      /\.log$/,
      /\.tmp$/
    ];

    return ignorePatterns.some(pattern => pattern.test(filename));
  }

  async generateCursorCommand(action, params = {}) {
    const commands = {
      open: `cursor "${params.file || this.workspacePath}"`,
      sync: `cursor --sync "${params.source}" "${params.target}"`,
      format: `cursor --format "${params.file}"`,
      analyze: `cursor --analyze "${params.file || this.workspacePath}"`,
      aiAssist: `cursor --ai-assist "${params.prompt}"`
    };

    const command = commands[action];
    
    if (!command) {
      throw new Error(`Unknown Cursor action: ${action}`);
    }

    return command;
  }

  async integrateWithAI(prompt, context = {}) {
    // Preparar contexto para Cursor AI
    const aiContext = {
      projectPath: this.workspacePath,
      currentFile: context.file || null,
      selection: context.selection || null,
      language: context.language || 'javascript',
      timestamp: new Date().toISOString()
    };

    // Aquí se integraría con la API de Cursor AI
    // Por ahora, devolvemos una estructura simulada
    return {
      prompt,
      context: aiContext,
      suggestions: [
        {
          type: 'code',
          content: '// AI-generated code would go here',
          confidence: 0.85
        }
      ],
      metadata: {
        model: 'cursor-ai',
        processingTime: 1234
      }
    };
  }
}

module.exports = CursorClient;