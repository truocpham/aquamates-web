const expo = require('eslint-config-expo/flat');

module.exports = [...expo, { ignores: ['dist/*', '.claude/*', '.lighthouseci/*', 'node_modules/*', 'supabase/functions/*/index.ts'] }];
