const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.publicPath = '/fin-pet/';

module.exports = withNativeWind(config, { input: './src/app/styles/global.css' });