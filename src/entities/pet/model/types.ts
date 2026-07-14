export type PetType = 'cat' | 'dog' | 'dragon' | 'fox';
export type PetMood = 'idle' | 'happy' | 'sad' | 'hungry' | 'sleeping';

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  color: string;
  level: number;
  experience: number;
  stage: number;
  hunger: number;
  happiness: number;
  energy: number;
  accessories: string[];
  roomDecorations: string[];
  createdAt: string;
  lastFedAt: string;
  lastPlayedAt: string;
  lastStatusUpdateAt: string;
}

export interface PetColors {
  id: string;
  hex: string;
  name: string;
}

export const PET_COLORS: PetColors[] = [
  { id: 'orange', hex: '#FF6B6B', name: 'Оранжевый' },
  { id: 'blue', hex: '#4ECDC4', name: 'Голубой' },
  { id: 'pink', hex: '#FFB6C1', name: 'Розовый' },
  { id: 'green', hex: '#98D8C8', name: 'Зелёный' },
];

export const PET_EMOJIS: Record<PetType, string> = {
  cat: '🐱',
  dog: '🐶',
  dragon: '🐉',
  fox: '🦊',
};

export const PET_STAGE_NAMES: Record<number, string> = {
  1: 'Яйцо',
  2: 'Малыш',
  3: 'Подросток',
  4: 'Взрослый',
  5: 'Мастер',
};

export const MAX_ACCESSORIES = 3;
