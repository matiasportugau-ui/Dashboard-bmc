#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');

class DeploymentManager {
  constructor() {
    this.rootDir = process.cwd();
    this.logPath = path.join(this.rootDir, 'logs/deployment.log');
    this.backupDir = path.join(this.rootDir, 'backups');
    
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(path.dirname(this.logPath));
    await fs.ensureDir(this.backupDir);
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(this.logPath, logEntry);
    console.log(chalk.blue(`[Deploy]`), message);
  }

  async detectProjectType() {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    const requirementsPath = path.join(this.rootDir, 'requirements.txt');
    const dockerfilePath = path.join(this.rootDir, 'Dockerfile');

    if (await fs.pathExists(dockerfilePath)) {
      return 'docker';
    } else if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.dependencies?.react) return 'react-app';
      if (packageJson.dependencies?.express) return 'node-api';
      if (packageJson.dependencies?.electron) return 'electron-app';
      return 'node-project';
    } else if (await fs.pathExists(requirementsPath)) {
      return 'python-project';
    }

    return 'static';
  }

  async promptDeploymentOptions() {
    const projectType = await this.detectProjectType();
    
    const questions = [
      {
        type: 'list',
        name: 'environment',
        message: 'Select deployment environment:',
        choices: [
          { name: 'Development', value: 'dev' },
          { name: 'Staging', value: 'staging' },
          { name: 'Production', value: 'prod' }
        ]
      },
      {
        type: 'list',
        name: 'platform',
        message: 'Select deployment platform:',
        choices: this.getPlatformChoices(projectType)
      },
      {
        type: 'confirm',
        name: 'runTests',
        message: 'Run tests before deployment?',
        default: true
      },
      {
        type: 'confirm',
        name: 'createBackup',
        message: 'Create backup before deployment?',
        default: true
      },
      {
        type: 'confirm',
        name: 'autoRollback',
        message: 'Enable automatic rollback on failure?',
        default: true
      }
    ];

    return inquirer.prompt(questions);
  }

  getPlatformChoices(projectType) {
    const choices = [
      { name: 'Manual/Custom', value: 'manual' }
    ];

    switch (projectType) {
      case 'react-app':
        choices.unshift(
          { name: 'Vercel', value: 'vercel' },
          { name: 'Netlify', value: 'netlify' },
          { name: 'GitHub Pages', value: 'github-pages' }
        );
        break;
      case 'node-api':
      case 'python-project':
        choices.unshift(
          { name: 'Railway', value: 'railway' },
          { name: 'Heroku', value: 'heroku' },
          { name: 'DigitalOcean', value: 'digitalocean' }
        );
        break;
      case 'docker':
        choices.unshift(
          { name: 'Docker Hub', value: 'docker-hub' },
          { name: 'AWS ECR', value: 'aws-ecr' },
          { name: 'Google Cloud Run', value: 'gcp-run' }
        );
        break;
    }

    return choices;
  }

  async runTests() {
    await this.log('Running tests...');
    console.log(chalk.yellow('🧪 Running tests...'));

    try {
      // Run JavaScript/TypeScript tests
      if (await fs.pathExists(path.join(this.rootDir, 'package.json'))) {
        const packageJson = await fs.readJson(path.join(this.rootDir, 'package.json'));
        if (packageJson.scripts?.test) {
          execSync('npm test -- --watchAll=false', { stdio: 'inherit' });
        }
      }

      // Run Python tests
      if (await fs.pathExists(path.join(this.rootDir, 'requirements.txt'))) {
        try {
          execSync('pytest --tb=short', { stdio: 'inherit' });
        } catch (error) {
          // pytest might not be installed, try python -m pytest
          execSync('python -m pytest --tb=short', { stdio: 'inherit' });
        }
      }

      console.log(chalk.green('✓ All tests passed'));
      await this.log('All tests passed');
      return true;

    } catch (error) {
      console.error(chalk.red('✗ Tests failed'));
      await this.log(`Tests failed: ${error.message}`);
      return false;
    }
  }

  async createBackup() {
    await this.log('Creating backup...');
    console.log(chalk.yellow('💾 Creating backup...'));

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // Create backup excluding node_modules, venv, etc.
      const excludePatterns = [
        'node_modules',
        'venv',
        '.git',
        'dist',
        'build',
        '__pycache__',
        '*.log'
      ].map(pattern => `--exclude=${pattern}`).join(' ');

      execSync(`tar ${excludePatterns} -czf ${backupPath}.tar.gz .`, { 
        stdio: 'inherit' 
      });

      console.log(chalk.green(`✓ Backup created: ${backupName}.tar.gz`));
      await this.log(`Backup created: ${backupName}.tar.gz`);
      return backupPath;

    } catch (error) {
      console.error(chalk.red('✗ Backup creation failed'));
      await this.log(`Backup creation failed: ${error.message}`);
      throw error;
    }
  }

  async deployToVercel() {
    console.log(chalk.blue('🚀 Deploying to Vercel...'));
    
    try {
      // Check if Vercel CLI is installed
      execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing Vercel CLI...'));
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    execSync('vercel --prod', { stdio: 'inherit' });
    console.log(chalk.green('✓ Deployed to Vercel'));
    await this.log('Deployed to Vercel successfully');
  }

  async deployToNetlify() {
    console.log(chalk.blue('🚀 Deploying to Netlify...'));
    
    try {
      execSync('netlify --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing Netlify CLI...'));
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    }

    execSync('npm run build', { stdio: 'inherit' });
    execSync('netlify deploy --prod --dir=build', { stdio: 'inherit' });
    console.log(chalk.green('✓ Deployed to Netlify'));
    await this.log('Deployed to Netlify successfully');
  }

  async deployToRailway() {
    console.log(chalk.blue('🚀 Deploying to Railway...'));
    
    try {
      execSync('railway --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing Railway CLI...'));
      execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    }

    execSync('railway deploy', { stdio: 'inherit' });
    console.log(chalk.green('✓ Deployed to Railway'));
    await this.log('Deployed to Railway successfully');
  }

  async deployToPlatform(platform) {
    switch (platform) {
      case 'vercel':
        await this.deployToVercel();
        break;
      case 'netlify':
        await this.deployToNetlify();
        break;
      case 'railway':
        await this.deployToRailway();
        break;
      case 'manual':
        console.log(chalk.blue('📋 Manual deployment selected'));
        console.log(chalk.yellow('Please follow your custom deployment process'));
        await this.log('Manual deployment selected');
        break;
      default:
        console.log(chalk.red(`Deployment to ${platform} not yet implemented`));
        await this.log(`Deployment to ${platform} not implemented`);
        throw new Error(`Platform ${platform} not supported`);
    }
  }

  async rollback(backupPath) {
    console.log(chalk.yellow('🔄 Rolling back deployment...'));
    await this.log('Starting rollback...');

    try {
      execSync(`tar -xzf ${backupPath}.tar.gz`, { stdio: 'inherit' });
      console.log(chalk.green('✓ Rollback completed'));
      await this.log('Rollback completed successfully');
    } catch (error) {
      console.error(chalk.red('✗ Rollback failed'));
      await this.log(`Rollback failed: ${error.message}`);
      throw error;
    }
  }

  async deploy() {
    try {
      console.log(chalk.green('🚀 Code Environment Deployment Manager'));
      console.log();

      const options = await this.promptDeploymentOptions();
      let backupPath = null;

      await this.log(`Starting deployment to ${options.platform} (${options.environment})`);

      // Create backup if requested
      if (options.createBackup) {
        backupPath = await this.createBackup();
      }

      // Run tests if requested
      if (options.runTests) {
        const testsPass = await this.runTests();
        if (!testsPass) {
          console.log(chalk.red('❌ Deployment aborted due to test failures'));
          return;
        }
      }

      // Deploy to selected platform
      await this.deployToPlatform(options.platform);

      console.log();
      console.log(chalk.green('🎉 Deployment completed successfully!'));
      console.log(chalk.blue(`Environment: ${options.environment}`));
      console.log(chalk.blue(`Platform: ${options.platform}`));
      
      if (backupPath) {
        console.log(chalk.gray(`Backup: ${path.basename(backupPath)}.tar.gz`));
      }

      await this.log('Deployment completed successfully');

    } catch (error) {
      console.error(chalk.red('✗ Deployment failed:'), error.message);
      await this.log(`Deployment failed: ${error.message}`);

      if (options?.autoRollback && backupPath) {
        console.log();
        const shouldRollback = await inquirer.prompt([{
          type: 'confirm',
          name: 'rollback',
          message: 'Would you like to rollback to the previous version?',
          default: true
        }]);

        if (shouldRollback.rollback) {
          await this.rollback(backupPath);
        }
      }

      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy();
}

module.exports = DeploymentManager;