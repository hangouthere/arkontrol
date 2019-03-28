const path = require('path');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const Util = require('./util');
const {
  BuildTimeDefs: {
    isProd,
    Outputs: { RootDir, DistDir, Backend: OutputInfo }
  },
  BaseConfigs: {
    CommonConfig,
    DevConfigMod: { backend: DevConfigMod }
  },
  Webpack: {
    WatchOptions: { backend: WatchOptions }
  }
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
  WatchOptions,
  // Add Dev/Prod config modifiers
  !isProd ? DevConfigMod : {}
);

Util.checkConfigOnly(config);

module.exports = config;
