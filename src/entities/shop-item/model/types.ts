export type ShopCategory = 'food' | 'toy' | 'accessory' | 'room_decoration' | 'investment';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  effect: {
    hunger?: number;
    happiness?: number;
    passiveIncome?: number;
  };
  rarity: Rarity;
  image: string;
  consumable: boolean;
  levelRequirement?: number;
}

export interface ShopCategoryConfig {
  id: ShopCategory | 'all';
  label: string;
  emoji: string;
}

export const SHOP_CATEGORIES: ShopCategoryConfig[] = [
  { id: 'all', label: 'Всё', emoji: '🛍️' },
  { id: 'food', label: 'Еда', emoji: '🍎' },
  { id: 'toy', label: 'Игрушки', emoji: '🎾' },
  { id: 'accessory', label: 'Аксессуары', emoji: '🎩' },
  { id: 'investment', label: 'Инвестиции', emoji: '📈' },
];
