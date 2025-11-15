#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function setup() {
  console.log('🚀 Setting up Code Development Environment...\n');

  try {
    // Check Node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 16) {
      console.error('❌ Node.js 16+ is required. Current version:', nodeVersion);
      process.exit(1);
    }
    
    console.log('✅ Node.js version:', nodeVersion);

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    try {
      await fs.access(envPath);
      console.log('✅ .env file found');
    } catch {
      console.log('📝 Creating .env file from template...');
      const envExample = await fs.readFile(path.join(__dirname, '..', '.env.example'), 'utf-8');
      await fs.writeFile(envPath, envExample);
      console.log('⚠️  Please edit .env file with your API keys and settings');
    }

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    await execAsync('npm install', { cwd: path.join(__dirname, '..') });
    console.log('✅ Dependencies installed');

    // Create necessary directories
    const dirs = [
      'logs',
      'generated',
      'src/components',
      'src/api',
      'src/utils',
      'tests/unit',
      'tests/integration',
      'public',
      'automation/logs'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
    }
    console.log('✅ Directory structure created');

    // Create .gitkeep files
    for (const dir of ['generated', 'logs', 'public']) {
      await fs.writeFile(
        path.join(__dirname, '..', dir, '.gitkeep'),
        '# This file ensures the directory is tracked by git\n'
      );
    }

    // Check ESLint
    try {
      await execAsync('npx eslint --version');
      console.log('✅ ESLint configured');
    } catch {
      console.log('⚠️  ESLint not properly configured');
    }

    // Create initial test setup file
    await fs.writeFile(
      path.join(__dirname, '..', 'tests', 'setup.js'),
      `// Test setup file
global.console = {
  ...console,
  // Suppress console output during tests
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
`
    );

    console.log('\n✨ Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Edit .env file with your configuration');
    console.log('2. Run "npm run automation:start" to start the automation system');
    console.log('3. Run "npm run dev" to start the development server');
    console.log('\nFor more information, see README.md');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup();