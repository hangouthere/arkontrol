const WebPackCfg = require('./webpack');
const Rules = require('./rules');
const Plugins = require('./plugins');
const { isProd } = require('./buildTime');

/**
 * Config for Common values across all bundles
 */
const CommonConfig = {
  mode: isProd ? 'production' : 'development',
  resolve: WebPackCfg.Resolver,
  output: {
    publicPath: '',
    pathinfo: true
  },
  node: {
    __dirname: false,
    __filename: false,
    fs: false,
    net: false,
    tls: false
  },
  module: {
    rules: [
      // Define Rules
      Rules.Fonts,
      Rules.Images,
      Rules.SCSS,
      Rules.TSCompile
    ]
  },
  plugins: [
    // Define Plugins
    Plugins.CircularDepChecker,
    Plugins.TSTypeChecker,
    Plugins.DefineConstants,
    Plugins.ExtractCSS
  ]
};

/**
 * Config modifier for Dev bundles.
 */
const DevConfigMod = {
  frontend: {
    // Add SourceMaps
    devtool: 'inline-source-map',
    module: {
      rules: [Rules.SourceMaps]
    },
    plugins: [Plugins.DLLReference, Plugins.HTMLIncludeAssets]
  },
  backend: {
    // Add SourceMaps
    devtool: 'inline-source-map',
    module: {
      rules: [Rules.SourceMaps]
    }
  }
};

module.exports = {
  CommonConfig,
  DevConfigMod
};
