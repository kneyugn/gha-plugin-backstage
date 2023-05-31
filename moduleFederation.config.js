const { dependencies } = require('./package.json');

module.exports = {
  name: 'gha',
  filename: 'remoteEntry.js',
  exposes: {
    './gha': './src/App.tsx',
  },
  remotes: {},
};