/**
 * Modular roll-up of various WebPack configurations.
 *
 * This allows for the configuration file to be more legible.
 */

const BaseConfigs = require('./baseConfigs');
const BuildTimeDefs = require('./buildTime');
const Plugins = require('./plugins');
const Rules = require('./rules');
const Webpack = require('./webpack');

module.exports = {
  BaseConfigs,
  BuildTimeDefs,
  Plugins,
  Rules,
  Webpack
};
