const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function syncWithCursor(data, logger) {
  logger.info('Ejecutando sincronización con Cursor...');
  
  const syncResult = {
    timestamp: new Date().toISOString(),
    auto: data.auto || false,
    cursorWorkspace: process.env.CURSOR_WORKSPACE_PATH,
    synced: [],
    errors: []
  };

  try {
    // Verificar que el workspace de Cursor existe
    if (!process.env.CURSOR_WORKSPACE_PATH) {
      throw new Error('CURSOR_WORKSPACE_PATH no está configurado en .env');
    }

    // Obtener archivos modificados recientemente
    const modifiedFiles = await getRecentlyModifiedFiles();
    
    for (const file of modifiedFiles) {
      try {
        // Preparar archivo para Cursor
        const prepared = await prepareFileForCursor(file);
        
        if (prepared.needsSync) {
          // Copiar archivo al workspace de Cursor si está configurado
          if (process.env.CURSOR_WORKSPACE_PATH && process.env.CURSOR_WORKSPACE_PATH !== 'your_cursor_workspace_path') {
            const destPath = path.join(
              process.env.CURSOR_WORKSPACE_PATH,
              prepared.relativePath
            );
            
            // Crear directorio si no existe
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            
            // Copiar archivo
            await fs.copyFile(file, destPath);
            
            syncResult.synced.push({
              source: file,
              destination: destPath,
              metadata: prepared.metadata
            });
            
            logger.info(`Archivo sincronizado con Cursor: ${prepared.relativePath}`);
          }
        }
      } catch (error) {
        syncResult.errors.push({
          file: file,
          error: error.message
        });
        logger.error(`Error sincronizando archivo ${file}: ${error.message}`);
      }
    }
    
    // Ejecutar comandos de Cursor si están disponibles
    if (data.commands && Array.isArray(data.commands)) {
      for (const command of data.commands) {
        try {
          const result = await executeCursorCommand(command);
          logger.info(`Comando ejecutado: ${command}`);
        } catch (error) {
          logger.error(`Error ejecutando comando: ${error.message}`);
        }
      }
    }
    
    // Guardar resultado de sincronización
    await fs.writeFile(
      path.join(__dirname, '../../cursor-sync-state.json'),
      JSON.stringify(syncResult, null, 2)
    );
    
    logger.info(`Sincronización con Cursor completada. ${syncResult.synced.length} archivos sincronizados.`);
    
    return syncResult;
  } catch (error) {
    logger.error(`Error en sincronización con Cursor: ${error.message}`);
    throw error;
  }
}

async function getRecentlyModifiedFiles() {
  const files = [];
  const srcDir = path.join(__dirname, '../../src');
  
  // Obtener archivos modificados en las últimas 24 horas
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  async function scanDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        if (stats.mtimeMs > oneDayAgo) {
          files.push(fullPath);
        }
      }
    }
  }
  
  try {
    await scanDirectory(srcDir);
  } catch (error) {
    // Si el directorio no existe, no es un error crítico
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  
  return files;
}

async function prepareFileForCursor(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '../..'), filePath);
  
  const metadata = {
    originalPath: filePath,
    relativePath: relativePath,
    size: content.length,
    lines: content.split('\n').length,
    language: getFileLanguage(filePath)
  };
  
  // Determinar si el archivo necesita sincronización
  const needsSync = shouldSyncFile(content, metadata);
  
  return {
    needsSync,
    relativePath,
    metadata
  };
}

function shouldSyncFile(content, metadata) {
  // No sincronizar archivos muy grandes
  if (metadata.size > 1000000) return false;
  
  // No sincronizar archivos binarios
  if (metadata.language === 'binary') return false;
  
  // Sincronizar archivos con cambios importantes
  if (content.includes('// CURSOR:') || content.includes('# CURSOR:')) return true;
  
  // Sincronizar archivos de código principales
  const importantExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py'];
  return importantExtensions.some(ext => metadata.originalPath.endsWith(ext));
}

function getFileLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.md': 'markdown',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml'
  };
  
  return languageMap[ext] || 'text';
}

async function executeCursorCommand(command) {
  // Aquí se ejecutarían comandos específicos de Cursor
  // Por ahora, solo logueamos
  console.log(`Ejecutando comando de Cursor: ${command}`);
  return { success: true, command };
}

module.exports = {
  task: syncWithCursor
};