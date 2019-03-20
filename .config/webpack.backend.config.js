const path = require('path');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const Util = require('./util');
const {
  BuildTimeDefs: {
    Outputs: { RootDir, DistDir, Backend: OutputInfo }
  },
  BaseConfigs: { CommonConfig },
  Webpack
} = require('./definitions');

const config = merge(
  // Common Configuration
  CommonConfig,
  // Build-specific configuration
  {
    target: 'node',
    entry: ['./src/backend/index.ts'],
    output: {
      path: path.join(RootDir, DistDir, OutputInfo.Path),
      filename: `index.js`
    },
    externals: [nodeExternals()]
  },
  // Watch Mod for Backend
  Webpack.WatchOptions.backend
);

Util.checkConfigOnly(config);

module.exports = config;
