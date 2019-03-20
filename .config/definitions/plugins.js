const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const {
  isHot,
  isProd,
  DLLManifestPath,
  HtmlTemplatePath,
  PackageInfo,
  ServerPort,
  WDSPort,
  Outputs: { DistDir, Frontend: OutputInfo }
} = require('./buildTime');

/**
 * Define constants via `DefinePlugin`.
 * Primarilly to populate `process.env`.
 */
const DefineConstants = new webpack.DefinePlugin({
  'process.env': {
    INIT_URI: JSON.stringify(
      // Build URI to init the UI from
      isHot ? `http://localhost:${WDSPort}` : `file://${path.resolve(OutputInfo.Path, 'index.html')}`
    ),
    HOT: JSON.stringify(isHot),
    SERVER_PORT: JSON.stringify(ServerPort),
    WDS_PORT: JSON.stringify(WDSPort)
  },
  SOCKET_URI: isHot ? JSON.stringify(`localhost:${ServerPort}`) : 'location.host'
});

/**
 * HTML Plugin to generate `index.html`
 * If Prod is detected, it will minify the HTML.
 */
const WebPackHTML = new HtmlWebpackPlugin({
  title: PackageInfo.name,
  template: HtmlTemplatePath,
  hash: true,
  filename: 'index.html',
  minify: !isProd
    ? {}
    : {
        collapseWhitespace: true
      }
});

/**
 * HTML Plugin Modifier to add DLL as script tag.
 */
const HTMLIncludeAssets = new HtmlWebpackIncludeAssetsPlugin({
  assets: [path.posix.join(OutputInfo.Scripts, `${OutputInfo.MainName}_dll.js`)],
  append: false,
  hash: true
});

/**
 * DLL Plugin to include F/E dependencies
 */
const DLL = new webpack.DllPlugin({
  name: `${OutputInfo.MainName}_dll`,
  path: DLLManifestPath
});

/**
 * DLLReference Plugin to reference F/E dependencies
 * not compiled in dev build
 */
const DLLReference = new webpack.DllReferencePlugin({
  context: OutputInfo.Scripts,
  manifest: DLLManifestPath
});

/**
 * Extract CSS into an external file.
 * If Prod is detected, it is hashed as well for caching purposes.
 */
const cssNames = {
  file: isProd ? '[name].[hash].css' : '[name].css',
  chunk: isProd ? '[id].[hash].css' : '[id].css'
};
const ExtractCSS = new MiniCSSExtractPlugin({
  filename: path.posix.join(OutputInfo.Styles, cssNames.file)
});

/**
 * Typechecking for Typescript.
 */
const TSTypeChecker = new ForkTsCheckerWebpackPlugin({
  tslint: true
});

module.exports = {
  DefineConstants,
  DLL,
  DLLReference,
  ExtractCSS,
  HTMLIncludeAssets,
  TSTypeChecker,
  WebPackHTML
};
