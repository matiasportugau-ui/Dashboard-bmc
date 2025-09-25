const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function syncWithGPT(data, logger) {
  logger.info('Ejecutando sincronización con GPT...');
  
  const syncState = {
    timestamp: new Date().toISOString(),
    auto: data.auto || false,
    files: [],
    errors: []
  };

  try {
    // Leer archivos del proyecto que necesitan sincronización
    const srcDir = path.join(__dirname, '../../src');
    const files = await getFilesToSync(srcDir);
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const relativePath = path.relative(path.join(__dirname, '../..'), file);
        
        // Analizar el archivo para determinar si necesita procesamiento
        const analysis = analyzeFile(content, relativePath);
        
        if (analysis.needsProcessing) {
          // Aquí iría la lógica para enviar a GPT
          // Por ahora, solo simulamos el proceso
          syncState.files.push({
            path: relativePath,
            status: 'synced',
            analysis: analysis
          });
          
          logger.info(`Archivo sincronizado: ${relativePath}`);
        }
      } catch (error) {
        syncState.errors.push({
          file: file,
          error: error.message
        });
        logger.error(`Error procesando archivo ${file}: ${error.message}`);
      }
    }
    
    // Guardar estado de sincronización
    await fs.writeFile(
      path.join(__dirname, '../../sync-state.json'),
      JSON.stringify(syncState, null, 2)
    );
    
    logger.info(`Sincronización completada. ${syncState.files.length} archivos procesados.`);
    
    return syncState;
  } catch (error) {
    logger.error(`Error en sincronización con GPT: ${error.message}`);
    throw error;
  }
}

async function getFilesToSync(directory) {
  const files = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursivamente obtener archivos de subdirectorios
      const subFiles = await getFilesToSync(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && shouldSyncFile(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function shouldSyncFile(filename) {
  const syncExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go'];
  return syncExtensions.some(ext => filename.endsWith(ext));
}

function analyzeFile(content, filePath) {
  const analysis = {
    needsProcessing: false,
    hasAIComments: false,
    hasTODOs: false,
    complexity: 'low'
  };
  
  // Buscar comentarios de IA
  if (content.includes('// AI:') || content.includes('# AI:')) {
    analysis.hasAIComments = true;
    analysis.needsProcessing = true;
  }
  
  // Buscar TODOs
  if (content.includes('TODO:') || content.includes('FIXME:')) {
    analysis.hasTODOs = true;
    analysis.needsProcessing = true;
  }
  
  // Analizar complejidad básica
  const lines = content.split('\n').length;
  if (lines > 500) {
    analysis.complexity = 'high';
  } else if (lines > 200) {
    analysis.complexity = 'medium';
  }
  
  return analysis;
}

module.exports = {
  task: syncWithGPT
};