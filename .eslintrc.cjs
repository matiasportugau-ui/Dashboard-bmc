/* eslint-env node */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: { 'import/resolver': { typescript: true, node: true } },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint']
    }
  ],
  rules: {
    'no-unused-vars': 'warn',
    'import/order': [
      'warn',
      { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }
    ]
  }
};

