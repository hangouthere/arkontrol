const path = require('path');
const merge = require('webpack-merge');
const Util = require('./util');
const {
  BuildTimeDefs: {
    isProd,
    Outputs: { RootDir, DistDir, Frontend: OutputInfo }
  },
  Plugins,
  BaseConfigs,
  Webpack
} = require('./definitions');

Util.checkDLLMissing();

const config = merge.smart(
  BaseConfigs.CommonConfig,
  // Build-specific configuration
  {
    entry: ['./src/frontend/index.tsx'],
    output: {
      path: path.join(RootDir, DistDir, OutputInfo.Path),
      filename: path.posix.join(OutputInfo.Scripts, `${OutputInfo.MainName}.js`)
    },
    plugins: [Plugins.WebPackHTML]
  },
  // Add Dev Server config
  Webpack.DevServer,
  // Add Dev/Prod config modifiers
  !isProd ? BaseConfigs.DevConfigMod.frontend : {}
);

Util.checkConfigOnly(config);

module.exports = config;
