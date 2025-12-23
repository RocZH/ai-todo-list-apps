// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable faster bundling by excluding unnecessary files
config.resolver.assetExts.push('bin', 'txt', 'jpg', 'png', 'gif', 'webp', 'svg', 'json');
config.resolver.sourceExts.push('cjs');

// Optimize for development
if (process.env.NODE_ENV !== 'production') {
  // Increase the number of workers to speed up initial bundling
  config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length / 2));
  
  // Add caching options
  config.cacheVersion = '1';
}

// Exclude unnecessary files from the bundle
config.resolver.blockList = [
  ...config.resolver.blockList,
  // Add any additional block patterns here
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

module.exports = config;