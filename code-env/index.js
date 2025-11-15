#!/usr/bin/env node

/**
 * Code Environment - Main Entry Point
 * 
 * Entorno de desarrollo automatizado compatible con AI Assistant
 * Punto de entrada principal para todas las operaciones
 */

const chalk = require('chalk');
const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

// Import modules
const AISync = require('./scripts/ai-communication/sync');
const ProjectCreator = require('./scripts/automation/create-project');
const DeploymentManager = require('./scripts/deployment/deploy');
const CodeEnvironmentSetup = require('./scripts/setup/init');

const program = new Command();

// CLI Configuration
program
  .name('code-env')
  .description('Entorno de desarrollo automatizado compatible con AI Assistant')
  .version('1.0.0');

// Setup command
program
  .command('setup')
  .description('Configurar el entorno de desarrollo inicial')
  .action(async () => {
    const setup = new CodeEnvironmentSetup();
    await setup.runSetup();
  });

// Create project command
program
  .command('create')
  .alias('new')
  .description('Crear un nuevo proyecto desde template')
  .option('-t, --template <template>', 'Especificar template a usar')
  .option('-n, --name <name>', 'Nombre del proyecto')
  .option('-d, --description <description>', 'Descripción del proyecto')
  .option('--no-git', 'No inicializar repositorio Git')
  .option('--no-deps', 'No instalar dependencias automáticamente')
  .action(async (options) => {
    const creator = new ProjectCreator();
    
    if (options.template && options.name) {
      // Non-interactive mode
      const details = {
        template: options.template,
        projectName: options.name,
        description: options.description || '',
        initGit: options.git !== false,
        installDeps: options.deps !== false
      };
      
      await creator.createProjectNonInteractive(details);
    } else {
      // Interactive mode
      await creator.createProject();
    }
  });

// AI Sync command
program
  .command('sync')
  .description('Sincronizar contexto con AI Assistant')
  .option('--force', 'Forzar sincronización completa')
  .option('--dry-run', 'Mostrar qué se sincronizaría sin hacer cambios')
  .action(async (options) => {
    const sync = new AISync();
    
    if (options.dryRun) {
      console.log(chalk.blue('Dry run mode - no changes will be made'));
      // Implement dry run logic
    }
    
    await sync.syncWithAI();
  });

// Deploy command
program
  .command('deploy')
  .description('Desplegar proyecto a plataforma seleccionada')
  .option('-e, --env <environment>', 'Entorno de deployment (dev|staging|prod)', 'dev')
  .option('-p, --platform <platform>', 'Plataforma de deployment')
  .option('--no-tests', 'Saltar ejecución de tests')
  .option('--no-backup', 'No crear backup antes del deployment')
  .action(async (options) => {
    const deployment = new DeploymentManager();
    
    if (options.platform && options.env) {
      // Non-interactive mode
      await deployment.deployNonInteractive({
        environment: options.env,
        platform: options.platform,
        runTests: options.tests !== false,
        createBackup: options.backup !== false
      });
    } else {
      // Interactive mode
      await deployment.deploy();
    }
  });

// List templates command
program
  .command('templates')
  .alias('list')
  .description('Listar templates disponibles')
  .action(async () => {
    const templatesDir = path.join(__dirname, 'templates');
    
    try {
      const templates = await fs.readdir(templatesDir);
      
      console.log(chalk.green('\n📋 Templates Disponibles:\n'));
      
      for (const template of templates) {
        const templatePath = path.join(templatesDir, template);
        const stats = await fs.stat(templatePath);
        
        if (stats.isDirectory()) {
          const readmePath = path.join(templatePath, 'README.md');
          let description = 'Sin descripción';
          
          if (await fs.pathExists(readmePath)) {
            const readme = await fs.readFile(readmePath, 'utf8');
            const match = readme.match(/^# (.+)$/m);
            description = match ? match[1] : description;
          }
          
          console.log(chalk.blue(`  ${template}`));
          console.log(chalk.gray(`    ${description}\n`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error listando templates:'), error.message);
    }
  });

// Status command
program
  .command('status')
  .description('Mostrar estado del entorno y proyectos')
  .action(async () => {
    console.log(chalk.green('\n📊 Estado del Entorno Code\n'));
    
    // Environment info
    console.log(chalk.blue('Entorno:'));
    console.log(`  Versión: 1.0.0`);
    console.log(`  Node.js: ${process.version}`);
    console.log(`  Directorio: ${process.cwd()}\n`);
    
    // Projects count
    const projectsDir = path.join(__dirname, 'projects');
    if (await fs.pathExists(projectsDir)) {
      const projects = await fs.readdir(projectsDir);
      const projectCount = projects.filter(async (p) => {
        const stats = await fs.stat(path.join(projectsDir, p));
        return stats.isDirectory();
      }).length;
      
      console.log(chalk.blue('Proyectos:'));
      console.log(`  Total: ${projectCount}`);
      console.log(`  Ubicación: ${projectsDir}\n`);
    }
    
    // Templates count
    const templatesDir = path.join(__dirname, 'templates');
    const templates = await fs.readdir(templatesDir);
    console.log(chalk.blue('Templates:'));
    console.log(`  Disponibles: ${templates.length}`);
    console.log(`  Ubicación: ${templatesDir}\n`);
    
    // Recent activity
    const logDir = path.join(__dirname, 'logs');
    if (await fs.pathExists(logDir)) {
      const logs = await fs.readdir(logDir);
      console.log(chalk.blue('Actividad reciente:'));
      console.log(`  Archivos de log: ${logs.length}`);
      console.log(`  Ubicación: ${logDir}\n`);
    }
  });

// Clean command
program
  .command('clean')
  .description('Limpiar archivos temporales y caches')
  .option('--logs', 'Limpiar archivos de log')
  .option('--cache', 'Limpiar cache de node_modules')
  .option('--backups', 'Limpiar backups antiguos')
  .action(async (options) => {
    console.log(chalk.yellow('🧹 Limpiando entorno...\n'));
    
    if (options.logs) {
      const logDir = path.join(__dirname, 'logs');
      if (await fs.pathExists(logDir)) {
        await fs.emptyDir(logDir);
        console.log(chalk.green('✓ Logs limpiados'));
      }
    }
    
    if (options.cache) {
      const nodeModules = path.join(__dirname, 'node_modules');
      if (await fs.pathExists(nodeModules)) {
        await fs.remove(nodeModules);
        console.log(chalk.green('✓ Cache de Node.js limpiado'));
      }
    }
    
    if (options.backups) {
      const backupDir = path.join(__dirname, 'backups');
      if (await fs.pathExists(backupDir)) {
        const backups = await fs.readdir(backupDir);
        const oldBackups = backups.filter(backup => {
          const backupPath = path.join(backupDir, backup);
          const stats = fs.statSync(backupPath);
          const dayOld = Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000;
          return dayOld;
        });
        
        for (const backup of oldBackups) {
          await fs.remove(path.join(backupDir, backup));
        }
        
        console.log(chalk.green(`✓ ${oldBackups.length} backups antiguos eliminados`));
      }
    }
    
    if (!options.logs && !options.cache && !options.backups) {
      console.log(chalk.blue('Especifica qué limpiar con --logs, --cache, o --backups'));
    }
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red('Comando inválido: %s\n'), program.args.join(' '));
  program.help();
});

// Parse arguments
if (process.argv.length === 2) {
  // No arguments provided, show help
  console.log(chalk.green('🎯 Code Environment CLI\n'));
  console.log(chalk.gray('Entorno de desarrollo automatizado compatible con AI Assistant\n'));
  program.help();
} else {
  program.parse(process.argv);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Error no manejado:'), reason);
  process.exit(1);
});

module.exports = program;