// lib/savings/goalOptions.test.ts
// Цели накопления — только улучшения ноутбука, копилки и кровати (27.09.2026).

import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import { getFirstGoalOptions, getSavingsGoalItems, goalBonusCaption } from './goalOptions';

describe('цели накопления', () => {
  it('в списке только улучшения ноутбука, копилки и кровати (без стартовых)', () => {
    const goals = getSavingsGoalItems();
    expect(goals.length).toBeGreaterThan(0);
    for (const item of goals) {
      expect(['laptop', 'piggybank', 'bed']).toContain(item.category);
      expect(item.is_starter).toBeFalsy();
    }
  });

  it('первая цель в онбординге — ближайшее улучшение каждой из трёх вещей', () => {
    const options = getFirstGoalOptions();
    expect(options.map((i) => i.category)).toEqual(['laptop', 'piggybank', 'bed']);
    for (const option of options) {
      const cheapest = Math.min(
        ...SHOP_CATALOG.filter((i) => i.category === option.category && !i.is_starter).map(
          (i) => i.price
        )
      );
      expect(option.price).toBe(cheapest);
    }
  });

  it('подпись показывает реальный бонус вещи', () => {
    const laptop = getFirstGoalOptions().find((i) => i.category === 'laptop')!;
    expect(goalBonusCaption(laptop)).toBe(`бонус к урокам +${laptop.coin_bonus_percent}%`);
  });
});
