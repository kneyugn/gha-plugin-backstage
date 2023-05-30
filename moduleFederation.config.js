module.exports = {
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './gha-plugin': './src/App.tsx',
  },
  remotes: {},
};
