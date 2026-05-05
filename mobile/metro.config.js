const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  vm: require.resolve('vm-browserify'),
  path: require.resolve('path-browserify'),
  process: require.resolve('process/browser'),
};

module.exports = config;
