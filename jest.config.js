const path = require('path');

// Ignore agent worktree copies (.claude) and Lighthouse output, anchored at this
// project's root so a checkout that itself lives under .claude/worktrees still runs.
const escape = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rootIgnore = ['.claude', '.lighthouseci'].map((d) => escape(path.join(__dirname, d) + path.sep));

module.exports = {
  preset: 'jest-expo',
  globalSetup: './jest.global-setup.js',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/dist/', ...rootIgnore],
  modulePathIgnorePatterns: rootIgnore,
};
