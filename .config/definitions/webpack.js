const path = require('path');
const {
  WDSPort,
  Outputs: { DistDir, Frontend: OutputInfo }
} = require('./buildTime');

/**
 * Resolve definitions for WebPack; particularly extensions that will resolve modules.
 */
const Resolver = {
  extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
};

//TODO: Is this still necessary?
// Thinking NO, but need to test with webpack-dev-server
const WatchOptions = {
  backend: {
    watchOptions: {
      ignored: [/_dist/, /node_modules/]
    }
  }
};

const DevServer = {
  devServer: {
    contentBase: path.join(DistDir, OutputInfo.Path),
    hot: true,
    historyApiFallback: true,
    port: WDSPort,
    watchOptions: {
      ignored: /backend/
    }
  }
};

module.exports = {
  DevServer,
  Resolver,
  WatchOptions
};
