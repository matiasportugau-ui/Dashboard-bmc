// Jest setup file for Code Environment

// Global test configuration
global.console = {
  ...console,
  // Silence console.log in tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.AI_PROVIDER = 'mock';
process.env.AUTO_SYNC = 'false';

// Global test helpers
global.testHelpers = {
  createMockProject: () => ({
    name: 'test-project',
    type: 'web-app',
    path: '/tmp/test-project',
    created: new Date().toISOString()
  }),
  
  createMockTemplate: (name = 'test-template') => ({
    name,
    path: `/templates/${name}`,
    description: `Test template: ${name}`
  }),
  
  mockExecSync: (command, result = '') => {
    jest.doMock('child_process', () => ({
      execSync: jest.fn(() => result)
    }));
  }
};

// Setup and teardown
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});