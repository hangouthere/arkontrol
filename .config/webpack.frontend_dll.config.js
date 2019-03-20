const path = require('path');
const merge = require('webpack-merge');
const Util = require('./util');
const {
  BaseConfigs,
  Plugins,
  BuildTimeDefs: {
    Outputs: { RootDir, DistDir, Frontend: OutputInfo },
    PackageInfo: { dependencies, excludes }
  }
} = require('./definitions');

Util.checkDLLExists();

const Entries = Util.stripExcludes(dependencies, excludes.frontEnd);

const config = merge(
  BaseConfigs.CommonConfig,
  // Build-specific configuration
  {
    entry: Entries,
    output: {
      path: path.join(RootDir, DistDir, OutputInfo.Path),
      filename: path.posix.join(OutputInfo.Scripts, `${OutputInfo.MainName}_dll.js`),
      library: `${OutputInfo.MainName}_dll`
    },
    plugins: [Plugins.DLL]
  }
);

Util.checkConfigOnly(config);

module.exports = config;
