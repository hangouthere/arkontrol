const path = require('path');
const fs = require('fs');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const {
  isHot,
  isProd,
  Outputs: { Frontend: FrontendOutputInfo, Backend: BackendOutputInfo }
} = require('./buildTime');

/**
 * Transpile TS[X] files
 */
const TSCompile = {
  test: /\.(ts|js)x?$/,
  loader: 'babel-loader',
  exclude: /node_modules/,
  options: {
    // babel-loader fails miserably at finding the config,
    // so we merely "import" it manually here
    ...JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.babelrc'))),
    cacheDirectory: true
  }
};

/**
 * Pre-Process JS files to enhance SourceMaps
 * TODO: See if this even works...
 */
const SourceMaps = {
  enforce: 'pre',
  test: /\.js$/,
  loader: 'source-map-loader'
};

/**
 * Transpile SCSS to CSS.
 * If Prod is detected, it will minify the HTML.
 */
const SCSS = {
  test: /\.scss$/,
  use: [
    isHot
      ? 'style-loader'
      : {
          loader: MiniCSSExtractPlugin.loader,
          options: {
            publicPath: '../'
          }
        },
    {
      loader: 'css-loader',
      options: {
        sourceMap: !isProd
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: !isProd
      }
    }
  ]
};

const Images = {
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        outputPath: FrontendOutputInfo.Images,
        name: '[name].[ext]'
      }
    }
  ]
};

const Fonts = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        outputPath: FrontendOutputInfo.Fonts,
        name: '[name].[ext]'
      }
    }
  ]
};

module.exports = {
  Fonts,
  Images,
  SCSS,
  SourceMaps,
  TSCompile
};
