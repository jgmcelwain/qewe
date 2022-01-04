/* eslint-env node */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-constant-condition': ['error', { checkLoops: false }],
  },
};
