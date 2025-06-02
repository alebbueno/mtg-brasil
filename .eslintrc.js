/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // parser para TypeScript
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['react', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
  ],
  settings: {
    react: {
      version: 'detect', // detecta automaticamente a versão do React
    },
  },
  rules: {
    // Regras personalizadas aqui (exemplo):
    'react/react-in-jsx-scope': 'off', // Next.js não precisa importar React no escopo
    '@typescript-eslint/explicit-module-boundary-types': 'off', // não exige tipagem explícita em funções exportadas
    // ... você pode adicionar mais regras aqui
  },
};
