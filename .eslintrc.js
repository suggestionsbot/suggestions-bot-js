module.exports = {
  extends: 'eslint:recommended',
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'block-scoped-var': 'error',
    'curly': ['error', 'multi-or-nest'],
    'no-empty-function': 'off',
    'no-labels': 'error',
    'no-useless-return': 'off',
    'semi': 'error',
    'eol-last': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'dot-location': ['error', 'property'],
    'handle-callback-err': 'off',
    'max-nested-callbacks': ['error', { 'max': 4 }],
    'max-statements-per-line': ['error', { 'max': 2 }],
    'no-floating-decimal': 'error',
    'no-lonely-if': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1, 'maxBOF': 0 }],
    'no-shadow': ['error', { 'allow': ['err', 'resolve', 'reject'] }],
    'no-trailing-spaces': ['error'],
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': 'error',
    'quotes': ['error', 'single'],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': 'error',
    'yoda': 'error'
  }
};
