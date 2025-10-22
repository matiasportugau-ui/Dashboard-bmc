#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Code Development Environment in development mode...\n');

// Start the main application
const mainProcess = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

mainProcess.on('error', (error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});

mainProcess.on('exit', (code) => {
  process.exit(code);
});

// Handle termination
process.on('SIGINT', () => {
  mainProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  mainProcess.kill('SIGTERM');
});