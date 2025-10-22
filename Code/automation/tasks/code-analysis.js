const fs = require('fs').promises;
const path = require('path');

async function analyzeCode(data, logger) {
  logger.info('Iniciando análisis de código...');
  
  const analysisResult = {
    timestamp: new Date().toISOString(),
    projectStats: {},
    codeQuality: {},
    suggestions: [],
    files: []
  };

  try {
    // Analizar estructura del proyecto
    analysisResult.projectStats = await analyzeProjectStructure();
    
    // Analizar calidad del código
    const srcDir = path.join(__dirname, '../../src');
    const files = await getAllCodeFiles(srcDir);
    
    for (const file of files) {
      const fileAnalysis = await analyzeFile(file);
      analysisResult.files.push(fileAnalysis);
    }
    
    // Generar métricas agregadas
    analysisResult.codeQuality = calculateCodeQualityMetrics(analysisResult.files);
    
    // Generar sugerencias
    analysisResult.suggestions = generateSuggestions(analysisResult);
    
    // Guardar resultado del análisis
    await fs.writeFile(
      path.join(__dirname, '../../code-analysis-report.json'),
      JSON.stringify(analysisResult, null, 2)
    );
    
    logger.info('Análisis de código completado');
    
    return analysisResult;
  } catch (error) {
    logger.error(`Error en análisis de código: ${error.message}`);
    throw error;
  }
}

async function analyzeProjectStructure() {
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    filesByType: {},
    totalSize: 0
  };
  
  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !shouldIgnoreDirectory(entry.name)) {
          stats.totalDirectories++;
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          stats.totalFiles++;
          const ext = path.extname(entry.name);
          stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;
          
          const fileStat = await fs.stat(fullPath);
          stats.totalSize += fileStat.size;
        }
      }
    } catch (error) {
      // Ignorar errores de directorios no accesibles
    }
  }
  
  await scanDirectory(path.join(__dirname, '../..'));
  
  return stats;
}

async function getAllCodeFiles(directory) {
  const files = [];
  
  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !shouldIgnoreDirectory(entry.name)) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && isCodeFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorar errores
    }
  }
  
  await scanDirectory(directory);
  return files;
}

async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(path.join(__dirname, '../..'), filePath);
  
  const analysis = {
    path: relativePath,
    metrics: {
      lines: lines.length,
      linesOfCode: 0,
      comments: 0,
      blankLines: 0,
      complexity: 0
    },
    issues: [],
    patterns: []
  };
  
  // Analizar líneas
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      analysis.metrics.blankLines++;
    } else if (isComment(trimmed)) {
      analysis.metrics.comments++;
    } else {
      analysis.metrics.linesOfCode++;
    }
    
    // Buscar patrones problemáticos
    checkForIssues(trimmed, analysis.issues);
    
    // Detectar patrones de código
    detectPatterns(trimmed, analysis.patterns);
  }
  
  // Calcular complejidad ciclomática básica
  analysis.metrics.complexity = calculateComplexity(content);
  
  return analysis;
}

function shouldIgnoreDirectory(name) {
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache'];
  return ignoreDirs.includes(name) || name.startsWith('.');
}

function isCodeFile(filename) {
  const codeExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs',
    '.cpp', '.c', '.cs', '.rb', '.php', '.swift', '.kt'
  ];
  return codeExtensions.some(ext => filename.endsWith(ext));
}

function isComment(line) {
  const commentPatterns = [
    /^\/\//,     // JavaScript, Java, C++
    /^#/,        // Python, Ruby, Shell
    /^\/\*/,     // Multi-line comment start
    /^\*/,       // Multi-line comment continuation
    /^--/,       // SQL, Haskell
    /^<!--/      // HTML, XML
  ];
  
  return commentPatterns.some(pattern => pattern.test(line));
}

function checkForIssues(line, issues) {
  const issuePatterns = [
    { pattern: /console\.log/, message: 'Console.log encontrado', severity: 'warning' },
    { pattern: /debugger/, message: 'Debugger statement encontrado', severity: 'error' },
    { pattern: /TODO:|FIXME:|XXX:/, message: 'Comentario TODO/FIXME encontrado', severity: 'info' },
    { pattern: /password\s*=\s*["']/, message: 'Posible contraseña hardcodeada', severity: 'critical' },
    { pattern: /api[_-]?key\s*=\s*["']/, message: 'Posible API key hardcodeada', severity: 'critical' }
  ];
  
  for (const { pattern, message, severity } of issuePatterns) {
    if (pattern.test(line)) {
      issues.push({ message, severity, line: line.trim() });
    }
  }
}

function detectPatterns(line, patterns) {
  const patternDetectors = [
    { pattern: /import .* from/, name: 'ES6 import' },
    { pattern: /require\(/, name: 'CommonJS require' },
    { pattern: /async\s+function|async\s*\(/, name: 'Async function' },
    { pattern: /class\s+\w+/, name: 'Class declaration' },
    { pattern: /interface\s+\w+/, name: 'Interface declaration' },
    { pattern: /function\s+\w+/, name: 'Function declaration' },
    { pattern: /=>\s*{/, name: 'Arrow function' }
  ];
  
  for (const { pattern, name } of patternDetectors) {
    if (pattern.test(line)) {
      const existing = patterns.find(p => p.name === name);
      if (existing) {
        existing.count++;
      } else {
        patterns.push({ name, count: 1 });
      }
    }
  }
}

function calculateComplexity(content) {
  // Complejidad ciclomática simplificada
  const complexityPatterns = [
    /if\s*\(/g,
    /else\s+if\s*\(/g,
    /while\s*\(/g,
    /for\s*\(/g,
    /case\s+/g,
    /catch\s*\(/g
  ];
  
  let complexity = 1; // Base complexity
  
  for (const pattern of complexityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  return complexity;
}

function calculateCodeQualityMetrics(files) {
  const metrics = {
    totalLines: 0,
    totalLinesOfCode: 0,
    totalComments: 0,
    averageComplexity: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    issuesBySeverity: {}
  };
  
  let totalComplexity = 0;
  
  for (const file of files) {
    metrics.totalLines += file.metrics.lines;
    metrics.totalLinesOfCode += file.metrics.linesOfCode;
    metrics.totalComments += file.metrics.comments;
    totalComplexity += file.metrics.complexity;
    
    if (file.issues.length > 0) {
      metrics.filesWithIssues++;
      metrics.totalIssues += file.issues.length;
      
      for (const issue of file.issues) {
        metrics.issuesBySeverity[issue.severity] = 
          (metrics.issuesBySeverity[issue.severity] || 0) + 1;
      }
    }
  }
  
  if (files.length > 0) {
    metrics.averageComplexity = totalComplexity / files.length;
  }
  
  metrics.commentRatio = metrics.totalLinesOfCode > 0 
    ? (metrics.totalComments / metrics.totalLinesOfCode) * 100 
    : 0;
  
  return metrics;
}

function generateSuggestions(analysisResult) {
  const suggestions = [];
  const { codeQuality } = analysisResult;
  
  // Sugerencias basadas en métricas
  if (codeQuality.averageComplexity > 10) {
    suggestions.push({
      type: 'refactoring',
      priority: 'high',
      message: 'La complejidad promedio es alta. Considera refactorizar funciones complejas.'
    });
  }
  
  if (codeQuality.commentRatio < 10) {
    suggestions.push({
      type: 'documentation',
      priority: 'medium',
      message: 'El ratio de comentarios es bajo. Considera agregar más documentación.'
    });
  }
  
  if (codeQuality.issuesBySeverity.critical > 0) {
    suggestions.push({
      type: 'security',
      priority: 'critical',
      message: `Se encontraron ${codeQuality.issuesBySeverity.critical} problemas críticos de seguridad.`
    });
  }
  
  // Sugerencias basadas en patrones
  const hasAsyncCode = analysisResult.files.some(f => 
    f.patterns.some(p => p.name === 'Async function')
  );
  
  if (hasAsyncCode) {
    suggestions.push({
      type: 'best-practice',
      priority: 'low',
      message: 'Asegúrate de manejar correctamente los errores en funciones async/await.'
    });
  }
  
  return suggestions;
}

module.exports = {
  task: analyzeCode
};