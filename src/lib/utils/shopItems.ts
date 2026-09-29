// lib/utils/shopItems.ts
// Общий хелпер для магазина и инвентаря (§12.5 ТЗ) — раньше был продублирован
// дословно в обоих экранах.

import type { ShopItem } from '@/lib/hooks/useShop';

export function getEffectDescription(item: ShopItem): string | null {
  if (item.energy_restore > 0) return `+${item.energy_restore}⚡ энергии сразу`;
  if (item.energy_max_bonus > 0) return `+${item.energy_max_bonus}⚡ к максимуму энергии`;
  if (item.energy_recovery_bonus > 0)
    return `+${item.energy_recovery_bonus}⚡/час к восстановлению`;
  if (item.coin_bonus_percent > 0) return `+${item.coin_bonus_percent}% к зарплате за смену`;
  if (item.savings_bonus_rate > 0) return `+${item.savings_bonus_rate} к бонусу накоплений`;
  if (item.ai_cost_reduction > 0) return `−${item.ai_cost_reduction}⚡ за вопрос ИИ-помощнику`;
  return null;
}
