#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');

class CodeEnvironmentSetup {
  constructor() {
    this.rootDir = path.join(__dirname, '../..');
    this.logPath = path.join(this.rootDir, 'logs/setup.log');
  }

  async log(message) {
    await fs.ensureDir(path.dirname(this.logPath));
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(this.logPath, logEntry);
    console.log(chalk.blue(`[Setup]`), message);
  }

  async checkSystemRequirements() {
    console.log(chalk.yellow('🔍 Checking system requirements...'));
    
    const requirements = [
      { name: 'Node.js', command: 'node --version', minVersion: '16.0.0' },
      { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
      { name: 'Python', command: 'python3 --version', minVersion: '3.8.0', optional: true },
      { name: 'Git', command: 'git --version', minVersion: '2.0.0' }
    ];

    for (const req of requirements) {
      try {
        const output = execSync(req.command, { encoding: 'utf8' }).trim();
        console.log(chalk.green(`✓ ${req.name}: ${output}`));
        await this.log(`${req.name} found: ${output}`);
      } catch (error) {
        if (req.optional) {
          console.log(chalk.yellow(`⚠ ${req.name}: Not found (optional)`));
          await this.log(`${req.name} not found (optional)`);
        } else {
          console.log(chalk.red(`✗ ${req.name}: Not found`));
          await this.log(`${req.name} not found - REQUIRED`);
          throw new Error(`${req.name} is required but not found`);
        }
      }
    }
  }

  async promptSetupOptions() {
    const questions = [
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Install Node.js dependencies?',
        default: true
      },
      {
        type: 'confirm',
        name: 'setupPython',
        message: 'Setup Python virtual environment?',
        default: true
      },
      {
        type: 'confirm',
        name: 'configureGit',
        message: 'Configure Git hooks?',
        default: true
      },
      {
        type: 'confirm',
        name: 'createSampleProject',
        message: 'Create a sample project to test the environment?',
        default: false
      }
    ];

    return inquirer.prompt(questions);
  }

  async installNodeDependencies() {
    console.log(chalk.blue('📦 Installing Node.js dependencies...'));
    
    try {
      process.chdir(this.rootDir);
      execSync('npm install', { stdio: 'inherit' });
      console.log(chalk.green('✓ Node.js dependencies installed'));
      await this.log('Node.js dependencies installed successfully');
    } catch (error) {
      console.error(chalk.red('✗ Failed to install Node.js dependencies'));
      await this.log(`Failed to install Node.js dependencies: ${error.message}`);
      throw error;
    }
  }

  async setupPythonEnvironment() {
    console.log(chalk.blue('🐍 Setting up Python environment...'));
    
    try {
      const venvPath = path.join(this.rootDir, 'venv');
      
      // Create virtual environment
      execSync('python3 -m venv venv', { cwd: this.rootDir, stdio: 'inherit' });
      
      // Install Python dependencies
      const activateScript = process.platform === 'win32' ? 
        'venv\\Scripts\\activate' : 'source venv/bin/activate';
      
      const pipCommand = process.platform === 'win32' ?
        'venv\\Scripts\\pip' : 'venv/bin/pip';
      
      execSync(`${pipCommand} install -r requirements.txt`, { 
        cwd: this.rootDir, 
        stdio: 'inherit' 
      });
      
      console.log(chalk.green('✓ Python environment setup complete'));
      await this.log('Python virtual environment created and dependencies installed');
      
    } catch (error) {
      console.error(chalk.red('✗ Failed to setup Python environment'));
      await this.log(`Failed to setup Python environment: ${error.message}`);
      // Don't throw - Python is optional
    }
  }

  async configureGitHooks() {
    console.log(chalk.blue('🔗 Configuring Git hooks...'));
    
    try {
      const hooksDir = path.join(this.rootDir, '.git/hooks');
      await fs.ensureDir(hooksDir);
      
      // Pre-commit hook
      const preCommitHook = `#!/bin/sh
# Code Environment pre-commit hook
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix errors before committing."
  exit 1
fi

# Run formatting
npm run format

echo "Pre-commit checks passed!"
exit 0
`;
      
      const preCommitPath = path.join(hooksDir, 'pre-commit');
      await fs.writeFile(preCommitPath, preCommitHook);
      await fs.chmod(preCommitPath, '755');
      
      console.log(chalk.green('✓ Git hooks configured'));
      await this.log('Git hooks configured successfully');
      
    } catch (error) {
      console.error(chalk.red('✗ Failed to configure Git hooks'));
      await this.log(`Failed to configure Git hooks: ${error.message}`);
      // Don't throw - Git hooks are optional
    }
  }

  async createDirectoryStructure() {
    console.log(chalk.blue('📁 Creating directory structure...'));
    
    const dirs = [
      'logs',
      'docs/context',
      'projects',
      'tools/custom'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(this.rootDir, dir);
      await fs.ensureDir(dirPath);
    }

    console.log(chalk.green('✓ Directory structure created'));
    await this.log('Directory structure created');
  }

  async createSampleProject() {
    console.log(chalk.blue('🚀 Creating sample project...'));
    
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/automation/create-project.js', { 
        cwd: this.rootDir,
        input: 'web-app\nsample-app\nA sample web application\ny\ny\n',
        stdio: 'inherit'
      });
      
      console.log(chalk.green('✓ Sample project created'));
      await this.log('Sample project created successfully');
      
    } catch (error) {
      console.error(chalk.red('✗ Failed to create sample project'));
      await this.log(`Failed to create sample project: ${error.message}`);
      // Don't throw - sample project is optional
    }
  }

  async runSetup() {
    try {
      console.log(chalk.green('🎯 Code Environment Setup'));
      console.log(chalk.gray('This will configure your development environment for AI-assisted coding'));
      console.log();

      await this.checkSystemRequirements();
      console.log();

      const options = await this.promptSetupOptions();
      console.log();

      await this.createDirectoryStructure();

      if (options.installDependencies) {
        await this.installNodeDependencies();
      }

      if (options.setupPython) {
        await this.setupPythonEnvironment();
      }

      if (options.configureGit) {
        await this.configureGitHooks();
      }

      if (options.createSampleProject) {
        await this.createSampleProject();
      }

      console.log();
      console.log(chalk.green('🎉 Setup completed successfully!'));
      console.log();
      console.log(chalk.yellow('Next steps:'));
      console.log('1. Run "npm run ai:sync" to initialize AI context');
      console.log('2. Run "npm run create:project" to create your first project');
      console.log('3. Check the documentation in docs/ for more information');
      console.log();
      console.log(chalk.blue('Happy coding! 🚀'));

      await this.log('Setup completed successfully');

    } catch (error) {
      console.error(chalk.red('✗ Setup failed:'), error.message);
      await this.log(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new CodeEnvironmentSetup();
  setup.runSetup();
}

module.exports = CodeEnvironmentSetup;