const path = require('path');
const {
  WDSPort,
  Outputs: { DistDir, Frontend: OutputInfo }
} = require('./buildTime');

/**
 * Resolve definitions for WebPack; particularly extensions that will resolve modules.
 */
const Resolver = {
  extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
  alias: {
    'react-dom': '@hot-loader/react-dom'
  }
};

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
    host: '0.0.0.0',
    port: WDSPort,
    watchOptions: {
      ignored: /backend/
    },
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
};

module.exports = {
  DevServer,
  Resolver,
  WatchOptions
};
