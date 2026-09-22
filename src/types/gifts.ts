// types/gifts.ts
// Типы для механики подарков (§14 ТЗ)

import type { Theme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

/**
 * Уровни редкости подарков (только для случайных, §14.2)
 */
export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** §14.1 — гарантированный выбор (1 из 2-3) или случайный (по таблице редкости) */
export type GiftMode = 'guaranteed_choice' | 'random';

/** §14.1/§14.4 — источник подарка */
export type GiftSource =
  | 'level_complete'
  | 'branch_complete'
  | 'savings_hold'
  | 'streak_7'
  | 'achievement'
  | 'random_event'
  | 'path_node';

/**
 * Конфигурация редкости (вероятности, цвета, названия, диапазон монет)
 */
export interface GiftRarityConfig {
  id: GiftRarity;
  name: string;
  probability: number; // 0-1, вероятность выпадения
  gradient: [string, string]; // градиент для карточки
  accentColor: string;
  coinRange: [number, number]; // §14.2 — диапазон монет внутри подарка
}

/**
 * Подарок (неоткрытый)
 */
export interface Gift {
  id: string;
  mode: GiftMode;
  source: GiftSource;
  rarity: GiftRarity | null; // задан для random сразу при создании; null для guaranteed_choice
  choiceOptions: number[] | null; // 2-3 item_id на выбор; только для guaranteed_choice
  branchId: number | null; // ID темы, если подарок связан с веткой
  themeName?: string; // название темы (для тематических подарков)
  /** ID узла-подарка в дорожке уроков (source: 'path_node') — для отметки claimed. */
  sourceNodeId?: string | null;
  obtainedAt: string;
  isOpened: boolean;
}

/**
 * Статические данные редкостей (вероятность, диапазон монет) — не зависят от
 * темы, в отличие от gradient/accentColor (см. getGiftRarityConfig).
 */
const GIFT_RARITY_STATIC: Record<
  GiftRarity,
  { name: string; probability: number; coinRange: [number, number] }
> = {
  common: { name: 'Обычный', probability: 0.6, coinRange: [30, 70] }, // 60%
  rare: { name: 'Редкий', probability: 0.25, coinRange: [50, 100] }, // 25%
  epic: { name: 'Эпический', probability: 0.12, coinRange: [100, 200] }, // 12%
  legendary: { name: 'Легендарный', probability: 0.03, coinRange: [200, 500] }, // 3%
};

/** Градиент/акцент редкости — на основе theme.rarityX, реагирует на смену темы. */
function getGiftRarityVisual(
  rarity: GiftRarity,
  theme: Theme
): { gradient: [string, string]; accentColor: string } {
  switch (rarity) {
    case 'common':
      return {
        gradient: [colorPalettes.slate[500], colorPalettes.slate[600]],
        accentColor: theme.rarityCommon,
      };
    case 'rare':
      return {
        gradient: [theme.rarityRare, colorPalettes.indigo[500]],
        accentColor: theme.rarityRare,
      };
    case 'epic':
      return {
        gradient: [theme.rarityEpic, colorPalettes.indigo[700]],
        accentColor: theme.rarityEpic,
      };
    case 'legendary':
      return {
        gradient: [theme.rarityLegendary, colorPalettes.orange[500]],
        accentColor: theme.rarityLegendary,
      };
  }
}

export function getGiftRarityConfig(
  rarity: GiftRarity | null,
  theme: Theme
): GiftRarityConfig | Omit<GiftRarityConfig, 'id' | 'probability' | 'coinRange'> {
  if (!rarity) {
    // Нейтральное оформление для guaranteed_choice-подарков — у них нет редкости.
    return { name: 'Выбор', gradient: theme.gradients.primary, accentColor: theme.primary };
  }
  return { id: rarity, ...GIFT_RARITY_STATIC[rarity], ...getGiftRarityVisual(rarity, theme) };
}

/** Случайное целое количество монет в диапазоне редкости (§14.2). */
export function rollCoinsForRarity(rarity: GiftRarity): number {
  const [min, max] = GIFT_RARITY_STATIC[rarity].coinRange;
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Помогает определить редкость по вероятности
 */
export function rollRarity(): GiftRarity {
  const roll = Math.random();
  let cumulative = 0;

  const rarities: GiftRarity[] = ['common', 'rare', 'epic', 'legendary'];
  for (const rarity of rarities) {
    cumulative += GIFT_RARITY_STATIC[rarity].probability;
    if (roll <= cumulative) {
      return rarity;
    }
  }

  return 'common'; // fallback
}
