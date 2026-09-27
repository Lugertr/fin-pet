// src/components/pet/PetLottie/configureLottieRenderer.web.ts
// В вебе lottie-react-native рисует через @lottiefiles/dotlottie-react, а тот —
// WASM-рендером, который по умолчанию скачивается с jsdelivr/unpkg. Офлайн-first:
// берём тот же .wasm из node_modules в бандл (Metro собирает .wasm как ассет,
// см. metro.config.js). Путь — из @lottiefiles/dotlottie-web той версии,
// которую тянет dotlottie-react: JS-обвязка и .wasm должны совпадать.
// Вызывается до первой анимации — модуль импортирует PetLottie.

import { setWasmUrl } from '@lottiefiles/dotlottie-react';
import { Asset } from 'expo-asset';

const DOTLOTTIE_WASM = require('@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm');

setWasmUrl(Asset.fromModule(DOTLOTTIE_WASM).uri);
