// lib/savings/goalOptions.test.ts
// Цели накопления — только улучшения ноутбука, копилки и кровати (27.09.2026).

import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import {
  getAvailableSavingsGoalItems,
  getFirstGoalOptions,
  getSavingsGoalItems,
  goalBonusCaption,
} from './goalOptions';

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

  it('подпись показывает реальный бонус вещи — как в магазине', () => {
    const byCategory = (category: string) =>
      getFirstGoalOptions().find((i) => i.category === category)!;
    const laptop = byCategory('laptop');
    const piggybank = byCategory('piggybank');
    const bed = byCategory('bed');
    expect(goalBonusCaption(laptop)).toBe(`+${laptop.coin_bonus_percent}% к зарплате за смену`);
    expect(goalBonusCaption(piggybank)).toBe(`+${piggybank.savings_bonus_rate}% к бонусу копилки`);
    expect(goalBonusCaption(bed)).toBe(`+${bed.energy_max_bonus}⚡ к максимуму энергии`);
  });
});

describe('цели, которые ещё можно купить', () => {
  it('без покупок доступны все цели', () => {
    expect(getAvailableSavingsGoalItems({})).toEqual(getSavingsGoalItems());
  });

  it('купленная вещь из списка пропадает (проданная — возвращается)', () => {
    const [first, second] = getSavingsGoalItems();
    const available = getAvailableSavingsGoalItems({ [first.id]: 1, [second.id]: 0 });
    expect(available.map((i) => i.id)).not.toContain(first.id);
    expect(available.map((i) => i.id)).toContain(second.id);
  });

  it('всё куплено — целей нет', () => {
    const owned = Object.fromEntries(getSavingsGoalItems().map((i) => [i.id, 1]));
    expect(getAvailableSavingsGoalItems(owned)).toEqual([]);
  });
});
