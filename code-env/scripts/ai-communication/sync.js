#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');
const chalk = require('chalk');

class AISync {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/environment.yaml');
    this.contextDir = path.join(__dirname, '../../docs/context');
    this.logPath = path.join(__dirname, '../../logs/ai-sync.log');
    
    this.loadConfig();
    this.ensureDirectories();
  }

  async loadConfig() {
    try {
      const configFile = await fs.readFile(this.configPath, 'utf8');
      this.config = yaml.parse(configFile);
    } catch (error) {
      console.error(chalk.red('Error loading config:'), error.message);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    await fs.ensureDir(this.contextDir);
    await fs.ensureDir(path.dirname(this.logPath));
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(this.logPath, logEntry);
    console.log(chalk.blue(`[AI Sync]`), message);
  }

  async generateProjectContext() {
    const context = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      projects: [],
      templates: [],
      recentChanges: []
    };

    // Scan projects
    const projectsDir = path.join(__dirname, '../../projects');
    if (await fs.pathExists(projectsDir)) {
      const projects = await fs.readdir(projectsDir);
      for (const project of projects) {
        const projectPath = path.join(projectsDir, project);
        const stats = await fs.stat(projectPath);
        if (stats.isDirectory()) {
          context.projects.push({
            name: project,
            path: projectPath,
            lastModified: stats.mtime,
            type: await this.detectProjectType(projectPath)
          });
        }
      }
    }

    // Scan templates
    const templatesDir = path.join(__dirname, '../../templates');
    const templates = await fs.readdir(templatesDir);
    for (const template of templates) {
      const templatePath = path.join(templatesDir, template);
      const stats = await fs.stat(templatePath);
      if (stats.isDirectory()) {
        context.templates.push({
          name: template,
          path: templatePath,
          description: await this.getTemplateDescription(templatePath)
        });
      }
    }

    return context;
  }

  async detectProjectType(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    const pubspecPath = path.join(projectPath, 'pubspec.yaml');

    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.dependencies?.react) return 'react-app';
      if (packageJson.dependencies?.express) return 'node-api';
      if (packageJson.dependencies?.electron) return 'desktop-app';
      return 'node-project';
    }

    if (await fs.pathExists(requirementsPath)) return 'python-project';
    if (await fs.pathExists(pubspecPath)) return 'flutter-app';

    return 'unknown';
  }

  async getTemplateDescription(templatePath) {
    const readmePath = path.join(templatePath, 'README.md');
    if (await fs.pathExists(readmePath)) {
      const readme = await fs.readFile(readmePath, 'utf8');
      const match = readme.match(/^# (.+)$/m);
      return match ? match[1] : 'No description available';
    }
    return 'No description available';
  }

  async updateContextFiles() {
    const context = await this.generateProjectContext();
    
    // Write main context file
    const contextFile = path.join(this.contextDir, 'project-context.json');
    await fs.writeJson(contextFile, context, { spaces: 2 });

    // Write summary for AI
    const summary = {
      totalProjects: context.projects.length,
      availableTemplates: context.templates.map(t => t.name),
      lastSync: context.timestamp,
      environment: context.environment.name
    };

    const summaryFile = path.join(this.contextDir, 'summary.json');
    await fs.writeJson(summaryFile, summary, { spaces: 2 });

    await this.log(`Context updated: ${context.projects.length} projects, ${context.templates.length} templates`);
  }

  async syncWithAI() {
    try {
      await this.log('Starting AI synchronization...');
      
      await this.updateContextFiles();
      
      // Here you could add actual AI API calls if needed
      // For now, we just update the context files
      
      await this.log('AI synchronization completed successfully');
      console.log(chalk.green('✓ AI sync completed'));
      
    } catch (error) {
      await this.log(`Error during sync: ${error.message}`);
      console.error(chalk.red('✗ AI sync failed:'), error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const sync = new AISync();
  sync.syncWithAI();
}

module.exports = AISync;