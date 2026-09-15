// types/gifts.ts
// Типы для механики подарков (бывшие лутбоксы)

import { ShopItem } from '@/lib/hooks/useShop';

/**
 * Уровни редкости подарков
 */
export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Конфигурация редкости (вероятности, цвета, названия)
 */
export interface GiftRarityConfig {
  id: GiftRarity;
  name: string;
  probability: number; // 0-1, вероятность выпадения
  gradient: [string, string]; // градиент для карточки
  accentColor: string;
  coinBonus: number; // бонус монет внутри подарка
}

/**
 * Подарок (неоткрытый)
 */
export interface Gift {
  id: string;
  rarity: GiftRarity;
  branchId: number | null; // ID темы, за которую получен подарок (если за тему)
  themeName?: string; // название темы (для тематических подарков)
  obtainedAt: string;
  isOpened: boolean;
}

/**
 * Результат открытия подарка
 */
export interface GiftOpeningResult {
  giftId: string;
  rarity: GiftRarity;
  item: ShopItem | null; // предмет из подарка
  coins: number; // бонус монет
}

/**
 * История открытия подарков
 */
export interface GiftHistoryEntry {
  giftId: string;
  rarity: GiftRarity;
  itemName: string;
  itemIcon: string;
  coins: number;
  openedAt: string;
}

/**
 * Конфигурации редкостей
 */
export const GIFT_RARITY_CONFIGS: Record<GiftRarity, GiftRarityConfig> = {
  common: {
    id: 'common',
    name: 'Обычный',
    probability: 0.6, // 60%
    gradient: ['#64748B', '#475569'],
    accentColor: '#94A3B8',
    coinBonus: 25,
  },
  rare: {
    id: 'rare',
    name: 'Редкий',
    probability: 0.25, // 25%
    gradient: ['#3B82F6', '#6366F1'],
    accentColor: '#60A5FA',
    coinBonus: 75,
  },
  epic: {
    id: 'epic',
    name: 'Эпический',
    probability: 0.12, // 12%
    gradient: ['#A855F7', '#EC4899'],
    accentColor: '#C084FC',
    coinBonus: 150,
  },
  legendary: {
    id: 'legendary',
    name: 'Легендарный',
    probability: 0.03, // 3%
    gradient: ['#F59E0B', '#EF4444'],
    accentColor: '#FBBF24',
    coinBonus: 300,
  },
};

/**
 * Помогает определить редкость по вероятности
 */
export function rollRarity(): GiftRarity {
  const roll = Math.random();
  let cumulative = 0;

  const rarities: GiftRarity[] = ['common', 'rare', 'epic', 'legendary'];
  for (const rarity of rarities) {
    cumulative += GIFT_RARITY_CONFIGS[rarity].probability;
    if (roll <= cumulative) {
      return rarity;
    }
  }

  return 'common'; // fallback
}
