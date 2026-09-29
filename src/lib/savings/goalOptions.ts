// lib/savings/goalOptions.ts
// Цели накопления (решение пользователя 27.09.2026): копить можно только на
// улучшения трёх вещей с бонусами — ноутбук, копилку, кровать. Одни и те же
// варианты — в онбординге («Выбери первую цель») и в «Копилке».

import { SHOP_CATALOG, ShopItem } from '@/lib/hooks/useShop';
import { isSavingsGoalItem, SAVINGS_GOAL_CATEGORIES } from '@/lib/utils/itemCategories';
import { getEffectDescription } from '@/lib/utils/shopItems';

/** Все цели: по категориям в порядке ноутбук → копилка → кровать, внутри — по цене. */
export function getSavingsGoalItems(): ShopItem[] {
  return SHOP_CATALOG.filter(isSavingsGoalItem).sort(
    (a, b) =>
      SAVINGS_GOAL_CATEGORIES.indexOf(a.category) - SAVINGS_GOAL_CATEGORIES.indexOf(b.category) ||
      a.price - b.price
  );
}

/**
 * Цели, которые ещё можно купить: улучшения, которых нет в инвентаре. Уже
 * купленную вещь целью не выбрать; пустой список — копить больше не на что,
 * и окно обязательного выбора цели не показывается.
 */
export function getAvailableSavingsGoalItems(ownedItems: Record<number, number>): ShopItem[] {
  return getSavingsGoalItems().filter((item) => (ownedItems[item.id] ?? 0) <= 0);
}

/** Первая цель в онбординге — ближайшее (самое дешёвое) улучшение каждой из трёх вещей. */
export function getFirstGoalOptions(): ShopItem[] {
  return SAVINGS_GOAL_CATEGORIES.map((category) =>
    getSavingsGoalItems().find((item) => item.category === category)
  ).filter((item): item is ShopItem => item !== undefined);
}

/**
 * Подпись под целью — что вещь реально даёт, той же фразой, что в магазине:
 * «+10% к зарплате за смену», «+2% к бонусу копилки», «+15⚡ к максимуму
 * энергии» (решение пользователя 29.09.2026: раньше ноутбук обещал «бонус к
 * урокам», а монет за уроки нет — ноутбук прибавляет к зарплате смены).
 */
export function goalBonusCaption(item: ShopItem): string {
  return getEffectDescription(item) ?? 'улучшение комнаты';
}
