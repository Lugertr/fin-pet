const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite/web загружает wa-sqlite.wasm через `import` — Metro по умолчанию
// не резолвит .wasm как ассет, из-за чего веб-бандл падает с Resolution Error.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './src/app/styles/global.css' });