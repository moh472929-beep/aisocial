module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'node/no-unsupported-features/es-syntax': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'consistent-return': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',
    'max-len': ['warn', { code: 120 }],
    'comma-dangle': ['error', 'only-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
  },
};