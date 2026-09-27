// src/constants/petAssets.ts
// Конфигурация ассетов питомца и комнаты
// ВАЖНО: Все пути к файлам должны быть статическими строками!

export type PetType = 'robot' | 'bear' | 'cat';
/** Переосмысление (2 состояния вместо 4): 'happy'+'neutral' слились в 'idle',
 * 'sad'+'sleeping' — в 'sleeping' (та же граница mood<=20, что раньше отделяла
 * 'sad' от 'neutral', теперь отделяет 'sleeping' от 'idle', см. getMoodState). */
export type PetMoodState = 'idle' | 'sleeping';

export const PET_RENDER_MODE: 'emoji' | 'assets' = 'assets';

export const PET_EMOJIS: Record<PetType, Record<PetMoodState, string>> = {
  robot: { idle: '🤖', sleeping: '😴' },
  bear: { idle: '🐻', sleeping: '😴' },
  cat: { idle: '🐱', sleeping: '😴' },
};

export function getMoodState(mood: number): PetMoodState {
  return mood <= 20 ? 'sleeping' : 'idle';
}

// ============================================
// ПИТОМЦЫ (SVG файлы)
// ============================================
export const PET_ASSETS_SINGLE: Record<PetType, number> = {
  robot: require('../../assets/images/pets/robot/v0/idle.svg'),
  bear: require('../../assets/images/pets/bear/v0/idle.svg'),
  cat: require('../../assets/images/pets/cat/v0/idle.svg'),
};
