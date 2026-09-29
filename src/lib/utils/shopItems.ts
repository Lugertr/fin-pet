// lib/utils/shopItems.ts
// Общий хелпер для магазина и инвентаря (§12.5 ТЗ) — раньше был продублирован
// дословно в обоих экранах.

import type { ShopItem } from '@/lib/hooks/useShop';

/**
 * Цена товара для профиля. В демо-режиме магазин бесплатный (решение
 * пользователя 29.09.2026): за время показа не заработать на мебель, а
 * показать нужно всё. Продажа в демо — от этой же цены, то есть за 0 C, иначе
 * «взял даром — продал за половину» давало бы монеты из ничего. Цели банка
 * (накопления) — по настоящей цене, это другой контур.
 */
export function shopPrice(item: Pick<ShopItem, 'price'>, isDemo: boolean): number {
  return isDemo ? 0 : item.price;
}

export function getEffectDescription(item: ShopItem): string | null {
  if (item.energy_restore > 0) return `+${item.energy_restore}⚡ энергии сразу`;
  if (item.energy_max_bonus > 0) return `+${item.energy_max_bonus}⚡ к максимуму энергии`;
  if (item.energy_recovery_bonus > 0)
    return `+${item.energy_recovery_bonus}⚡/час к восстановлению`;
  if (item.coin_bonus_percent > 0) return `+${item.coin_bonus_percent}% к зарплате за смену`;
  // Бонус копилки — проценты к новым монетам в банке (Savings.computeDepositBonus).
  if (item.savings_bonus_rate > 0) return `+${item.savings_bonus_rate}% к бонусу копилки`;
  if (item.ai_cost_reduction > 0) return `−${item.ai_cost_reduction}⚡ за вопрос ИИ-помощнику`;
  return null;
}

/**
 * Вопрос после покупки (решение пользователя 29.09.2026): поставить вещь в
 * комнату или оставить в хранилище. С подсказкой, где работает её бонус —
 * как его считает игра (useShop): энергия — только от вещи в комнате,
 * зарплата и бонус копилки — от вещи в хранилище тоже.
 */
export function placementPromptText(item: ShopItem): string {
  const energyBonus = item.energy_max_bonus > 0 || item.energy_recovery_bonus > 0;
  const ownedBonus = item.coin_bonus_percent > 0 || item.savings_bonus_rate > 0;
  const bonusNote = energyBonus
    ? ' Бонус к энергии работает, только когда вещь стоит в комнате.'
    : ownedBonus
      ? ' Бонус работает, даже если вещь в хранилище.'
      : '';
  return `Поставить «${item.name}» в комнату сейчас? Если нет — вещь подождёт в хранилище.${bonusNote}`;
}
