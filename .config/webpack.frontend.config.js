const path = require('path');
const merge = require('webpack-merge');
const Util = require('./util');
const {
  BuildTimeDefs: {
    isProd,
    Outputs: { RootDir, DistDir, Frontend: OutputInfo }
  },
  Plugins,
  BaseConfigs: {
    CommonConfig,
    DevConfigMod: { frontend: DevConfigMod }
  },
  Webpack: { DevServer, Optimization }
} = require('./definitions');

Util.checkDLLMissing();

const config = merge.smart(
  CommonConfig,
  // Build-specific configuration
  {
    entry: ['./src/frontend/index.tsx'],
    output: {
      path: path.join(RootDir, DistDir, OutputInfo.Path),
      filename: path.posix.join(OutputInfo.Scripts, `${OutputInfo.MainName}.js`)
    },
    plugins: [Plugins.WebPackHTML, Plugins.CopyConnectionsFile]
  },
  // Add Dev Server config
  DevServer,
  // Add Dev/Prod config modifiers
  !isProd ? DevConfigMod : {},
  isProd ? Optimization : {}
);

Util.checkConfigOnly(config);

module.exports = config;
