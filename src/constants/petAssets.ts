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
// ФОН КОМНАТЫ
// Путь отсюда до корня: ../../ (из src/constants/)
// ============================================
export const ROOM_BACKGROUND = require('../../assets/images/rooms/background.png');

// ============================================
// ПИТОМЦЫ (SVG файлы)
// ============================================
export const PET_ASSETS_SINGLE: Record<PetType, number> = {
  robot: require('../../assets/images/pets/robot/idle.svg'),
  dragon: require('../../assets/images/pets/dragon/idle.svg'),
  cat: require('../../assets/images/pets/cat/idle.svg'),
};

// ============================================
// ДЕКОР
// ============================================
export const DECOR_ASSETS: Record<string, number> = {
  Кровать: require('../../assets/images/decor/bed.png'),
  Растение: require('../../assets/images/decor/plant.png'),
  Стол: require('../../assets/images/decor/table.png'),
  Лампа: require('../../assets/images/decor/lamp.png'),
  Ковёр: require('../../assets/images/decor/carpet.png'),
};

// Эмодзи-заглушки
export const DECOR_EMOJIS: Record<string, string> = {
  Кровать: '🛏️',
  Растение: '🪴',
  Стол: '🪑',
  Лампа: '💡',
  Ковёр: '🟫',
  Ноутбук: '💻',
};

// ============================================
// СТАРТОВЫЙ ДЕКОР
// ============================================
export const STARTING_DECOR = [
  { id: 'start-bed', name: 'Кровать', position: 'left' as const },
  { id: 'start-plant', name: 'Растение', position: 'right' as const },
  { id: 'start-lamp', name: 'Лампа', position: 'right' as const },
];
