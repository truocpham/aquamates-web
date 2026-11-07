const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  { ignores: ['dist/*', '.claude/*', '.lighthouseci/*', 'node_modules/*', 'supabase/functions/*/index.ts'] },
  // Node-run config file: __dirname is a valid global there.
  { files: ['jest.config.js'], languageOptions: { globals: { __dirname: 'readonly' } } },
];
