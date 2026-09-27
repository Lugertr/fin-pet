// lib/savings/goalOptions.ts
// Цели накопления (решение пользователя 27.09.2026): копить можно только на
// улучшения трёх вещей с бонусами — ноутбук, копилку, кровать. Одни и те же
// варианты — в онбординге («Выбери первую цель») и в «Копилке».

import { SHOP_CATALOG, ShopItem } from '@/lib/hooks/useShop';
import { isSavingsGoalItem, SAVINGS_GOAL_CATEGORIES } from '@/lib/utils/itemCategories';

/** Все цели: по категориям в порядке ноутбук → копилка → кровать, внутри — по цене. */
export function getSavingsGoalItems(): ShopItem[] {
  return SHOP_CATALOG.filter(isSavingsGoalItem).sort(
    (a, b) =>
      SAVINGS_GOAL_CATEGORIES.indexOf(a.category) - SAVINGS_GOAL_CATEGORIES.indexOf(b.category) ||
      a.price - b.price
  );
}

/** Первая цель в онбординге — ближайшее (самое дешёвое) улучшение каждой из трёх вещей. */
export function getFirstGoalOptions(): ShopItem[] {
  return SAVINGS_GOAL_CATEGORIES.map((category) =>
    getSavingsGoalItems().find((item) => item.category === category)
  ).filter((item): item is ShopItem => item !== undefined);
}

const GOAL_BONUS_LABEL: Record<string, string> = {
  laptop: 'бонус к урокам',
  piggybank: 'бонус к накоплениям',
  bed: 'бонус к энергии',
};

/** Подпись под целью: «бонус к урокам +10%» — с реальным числом вещи. */
export function goalBonusCaption(item: ShopItem): string {
  const label = GOAL_BONUS_LABEL[item.category] ?? 'улучшение комнаты';
  if (item.coin_bonus_percent > 0) return `${label} +${item.coin_bonus_percent}%`;
  if (item.savings_bonus_rate > 0) return `${label} +${item.savings_bonus_rate}%`;
  if (item.energy_max_bonus > 0) return `${label} +${item.energy_max_bonus}⚡`;
  return label;
}
