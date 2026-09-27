// lib/utils/imageAspectRatio.ts
// Реальное соотношение сторон (width/height) локального статического ассета
// (require()) — читается из метаданных, которые Metro сохраняет при сборке
// (актуально и для SVG — их размер тоже определяется по declared width/height/
// viewBox через image-size). Нужно, чтобы вписывать предметы комнаты/питомца
// в раскладку без искажения пропорций, а не считать их условно квадратными.
//
// react-native's Image.resolveAssetSource — нативный-only API, на web
// (react-native-web) падает с "Image.resolveAssetSource is not a function".
// Asset.fromModule() из expo-asset — тот же реестр ассетов Metro, но с
// отдельными web/native резолверами внутри пакета, поэтому работает на обеих
// платформах одинаково и синхронно для локальных require() (метаданные уже
// известны на этапе сборки, скачивать/ждать ничего не нужно).

import { Asset } from 'expo-asset';

const cache = new Map<number, number>();

export function getAssetAspectRatio(source: number): number {
  const cached = cache.get(source);
  if (cached !== undefined) return cached;

  const { width, height } = Asset.fromModule(source);
  const ratio = width && height ? width / height : 1;
  cache.set(source, ratio);
  return ratio;
}
