#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');

class ProjectCreator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../../templates');
    this.projectsDir = path.join(__dirname, '../../projects');
    this.logPath = path.join(__dirname, '../../logs/project-creation.log');
    
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.projectsDir);
    await fs.ensureDir(path.dirname(this.logPath));
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(this.logPath, logEntry);
    console.log(chalk.blue(`[Project Creator]`), message);
  }

  async getAvailableTemplates() {
    const templates = await fs.readdir(this.templatesDir);
    const templateInfo = [];

    for (const template of templates) {
      const templatePath = path.join(this.templatesDir, template);
      const stats = await fs.stat(templatePath);
      
      if (stats.isDirectory()) {
        const readmePath = path.join(templatePath, 'README.md');
        let description = 'No description available';
        
        if (await fs.pathExists(readmePath)) {
          const readme = await fs.readFile(readmePath, 'utf8');
          const match = readme.match(/^# (.+)$/m);
          description = match ? match[1] : description;
        }
        
        templateInfo.push({
          name: template,
          value: template,
          description
        });
      }
    }

    return templateInfo;
  }

  async promptProjectDetails() {
    const templates = await this.getAvailableTemplates();
    
    const questions = [
      {
        type: 'list',
        name: 'template',
        message: 'Select a project template:',
        choices: templates
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: input => {
          if (!input) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name should only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: ''
      },
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Initialize Git repository?',
        default: true
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: true
      }
    ];

    return inquirer.prompt(questions);
  }

  async copyTemplate(templateName, projectName) {
    const templatePath = path.join(this.templatesDir, templateName);
    const projectPath = path.join(this.projectsDir, projectName);

    if (await fs.pathExists(projectPath)) {
      throw new Error(`Project '${projectName}' already exists`);
    }

    await this.log(`Copying template '${templateName}' to '${projectName}'`);
    await fs.copy(templatePath, projectPath);

    return projectPath;
  }

  async customizeProject(projectPath, details) {
    // Update package.json if it exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = details.projectName;
      packageJson.description = details.description;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md');
    if (await fs.pathExists(readmePath)) {
      let readme = await fs.readFile(readmePath, 'utf8');
      readme = readme.replace(/{{PROJECT_NAME}}/g, details.projectName);
      readme = readme.replace(/{{PROJECT_DESCRIPTION}}/g, details.description);
      await fs.writeFile(readmePath, readme);
    }

    // Update Python requirements or other config files as needed
    // Add more customization logic here
  }

  async initializeGit(projectPath) {
    try {
      process.chdir(projectPath);
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit from Code Environment template"', { stdio: 'inherit' });
      await this.log('Git repository initialized');
    } catch (error) {
      await this.log(`Git initialization failed: ${error.message}`);
      console.warn(chalk.yellow('⚠ Git initialization failed'));
    }
  }

  async installDependencies(projectPath) {
    try {
      process.chdir(projectPath);
      
      // Install Node.js dependencies
      if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
        console.log(chalk.blue('Installing Node.js dependencies...'));
        execSync('npm install', { stdio: 'inherit' });
      }
      
      // Install Python dependencies
      if (await fs.pathExists(path.join(projectPath, 'requirements.txt'))) {
        console.log(chalk.blue('Installing Python dependencies...'));
        execSync('pip install -r requirements.txt', { stdio: 'inherit' });
      }
      
      await this.log('Dependencies installed successfully');
    } catch (error) {
      await this.log(`Dependency installation failed: ${error.message}`);
      console.warn(chalk.yellow('⚠ Some dependencies failed to install'));
    }
  }

  async createProject() {
    try {
      console.log(chalk.green('🚀 Welcome to Code Environment Project Creator'));
      console.log();

      const details = await this.promptProjectDetails();
      
      await this.log(`Creating new project: ${details.projectName}`);
      
      const projectPath = await this.copyTemplate(details.template, details.projectName);
      await this.customizeProject(projectPath, details);

      if (details.initGit) {
        await this.initializeGit(projectPath);
      }

      if (details.installDeps) {
        await this.installDependencies(projectPath);
      }

      console.log();
      console.log(chalk.green('✓ Project created successfully!'));
      console.log(chalk.blue(`📁 Location: ${projectPath}`));
      console.log();
      console.log(chalk.yellow('Next steps:'));
      console.log(`  cd ${path.relative(process.cwd(), projectPath)}`);
      console.log('  npm run dev  # or the appropriate start command');
      console.log();

      await this.log(`Project '${details.projectName}' created successfully`);

    } catch (error) {
      await this.log(`Error creating project: ${error.message}`);
      console.error(chalk.red('✗ Project creation failed:'), error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new ProjectCreator();
  creator.createProject();
}

module.exports = ProjectCreator;