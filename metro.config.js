const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite/web загружает wa-sqlite.wasm через `import` — Metro по умолчанию
// не резолвит .wasm как ассет, из-за чего веб-бандл падает с Resolution Error.
config.resolver.assetExts.push('wasm');

// input должен указывать на существующий файл: с несуществующим путём
// `expo export --platform web` зависает на запуске Tailwind CLI (NativeWind).
module.exports = withNativeWind(config, { input: './src/global.css' });