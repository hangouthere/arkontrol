const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const {
  isHot,
  isProd,
  DLLManifestPath,
  HtmlTemplatePath,
  ServerPort,
  WDSPort,
  Outputs: { RootDir, Frontend: FrontendOutputInfo, Backend: BackendOutputInfo }
} = require('./buildTime');

/**
 * Copy DB Migrations to dist output for runtime startup
 */
const CopyDBMigrations = new CopyPlugin([
  // Copy Migrations
  {
    from: path.resolve(RootDir, 'src', BackendOutputInfo.MainName, 'database', 'migrations'),
    to: path.join('database', 'migrations')
  }
]);

/**
 * Define constants via `DefinePlugin`.
 * Primarilly to populate `process.env`.
 */
const DefineConstants = new webpack.DefinePlugin({
  'process.env': {
    HOT: JSON.stringify(isHot),
    SERVER_PORT: JSON.stringify(ServerPort)
  }
});

/**
 * HTML Plugin to generate `index.html`
 * If Prod is detected, it will minify the HTML.
 */
const WebPackHTML = new HtmlWebpackPlugin({
  title: 'ArKontrol',
  template: HtmlTemplatePath,
  hash: true,
  filename: 'index.html',
  favicon: path.resolve(RootDir, 'src', FrontendOutputInfo.MainName, 'assets', 'favicon.ico'),
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
  assets: [path.posix.join(FrontendOutputInfo.Scripts, `${FrontendOutputInfo.MainName}_dll.js`)],
  append: false,
  hash: true
});

/**
 * DLL Plugin to include F/E dependencies
 */
const DLL = new webpack.DllPlugin({
  name: `${FrontendOutputInfo.MainName}_dll`,
  path: DLLManifestPath
});

/**
 * DLLReference Plugin to reference F/E dependencies
 * not compiled in dev build
 */
const DLLReference = new webpack.DllReferencePlugin({
  context: FrontendOutputInfo.Scripts,
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
  filename: path.posix.join(FrontendOutputInfo.Styles, cssNames.file)
});

/**
 * Typechecking for Typescript.
 */
const TSTypeChecker = new ForkTsCheckerWebpackPlugin({
  tslint: true
});

module.exports = {
  CopyDBMigrations,
  DefineConstants,
  DLL,
  DLLReference,
  ExtractCSS,
  HTMLIncludeAssets,
  TSTypeChecker,
  WebPackHTML
};
