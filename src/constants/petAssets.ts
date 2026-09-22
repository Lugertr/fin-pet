// src/constants/petAssets.ts
// Конфигурация ассетов питомца и комнаты
// ВАЖНО: Все пути к файлам должны быть статическими строками!

export type PetType = 'robot' | 'dragon' | 'cat';
export type PetMoodState = 'happy' | 'neutral' | 'sad' | 'sleeping';

export const PET_RENDER_MODE: 'emoji' | 'assets' = 'assets';

export const PET_EMOJIS: Record<PetType, Record<PetMoodState, string>> = {
  robot: { happy: '🤖', neutral: '🤖', sad: '🤖', sleeping: '😴' },
  dragon: { happy: '🐉', neutral: '🐉', sad: '🐉', sleeping: '😴' },
  cat: { happy: '😺', neutral: '🐱', sad: '😿', sleeping: '😴' },
};

export function getMoodState(mood: number): PetMoodState {
  if (mood <= 0) return 'sleeping';
  if (mood <= 20) return 'sad';
  if (mood <= 50) return 'neutral';
  return 'happy';
}

// ============================================
// ПИТОМЦЫ (SVG файлы)
// ============================================
export const PET_ASSETS_SINGLE: Record<PetType, number> = {
  robot: require('../../assets/images/pets/robot/v0/idle.svg'),
  dragon: require('../../assets/images/pets/dragon/v0/idle.svg'),
  cat: require('../../assets/images/pets/cat/v0/idle.svg'),
};
