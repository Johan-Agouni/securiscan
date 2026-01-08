const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    files: ['src/**/*.ts'],
    extends: [
      ...tseslint.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'jest.config.ts'],
  }
);
