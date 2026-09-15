// lib/utils/safeRequire.ts
// Безопасная загрузка ассетов: не падает, если файл отсутствует

/**
 * Безопасный require для ассетов
 * Возвращает null, если файл не найден
 *
 * Использование:
 *   const image = safeRequire('../../assets/images/room.png');
 *   if (image) { <Image source={image} /> }
 *
 * @param path - путь к файлу относительно текущего модуля
 * @returns ID ассета (число) или null, если файл не найден
 */
export function safeRequire(path: string): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path);
  } catch (error) {
    console.warn(`[safeRequire] Файл не найден: ${path}`);
    return null;
  }
}

/**
 * Безопасный require с фолбеком
 * Возвращает фолбек, если файл не найден
 *
 * Использование:
 *   const image = safeRequireWithFallback(
 *     '../../assets/images/room.png',
 *     require('../../assets/images/default.png')
 *   );
 *
 * @param path - путь к файлу относительно текущего модуля
 * @param fallback - фолбек-значение, если файл не найден
 * @returns ID ассета или фолбек
 */
export function safeRequireWithFallback<T>(path: string, fallback: T): number | T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path);
  } catch (error) {
    console.warn(`[safeRequireWithFallback] Файл не найден: ${path}, использую фолбек`);
    return fallback;
  }
}

/**
 * Безопасный require для аудиофайлов
 * Специфичный для expo-av
 *
 * @param path - путь к аудиофайлу
 * @returns объект с uri или null
 */
export function safeRequireAudio(path: string): { uri: string } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const assetId = require(path);
    return assetId;
  } catch (error) {
    console.warn(`[safeRequireAudio] Аудиофайл не найден: ${path}`);
    return null;
  }
}

/**
 * Проверяет, существует ли ассет
 *
 * @param path - путь к файлу относительно текущего модуля
 * @returns true, если файл существует
 */
export function assetExists(path: string): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(path);
    return true;
  } catch {
    return false;
  }
}
